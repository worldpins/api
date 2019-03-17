const uuid = require('uuid/v4');
const { ApolloError, AuthenticationError, UserInputError } = require('apollo-server-koa');

const dataController = require('../data');
const { makeLogger } = require('../utils/logger');
const { MAP_NOT_FOUND } = require('../constants/maps');

const logger = makeLogger('mapService');

const mapFields = ['id', 'name', 'comment', 'initial_area'];

class MapService {
  constructor() {
    this.dataController = dataController.knex;
  }

  async createMap({ name, comment, initialArea = {} }, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }

    let dbInitialArea;
    if (initialArea.latitude && initialArea.longitude) {
      dbInitialArea = `(${initialArea.longitude}, ${initialArea.latitude})`;
    }

    const mapId = uuid();
    await this.dataController('maps').insert({
      id: mapId,
      name,
      comment,
      initial_area: dbInitialArea,
    });

    await this.dataController('userHasMaps').insert({
      map_id: mapId,
      user_id: decodedToken.userId,
      rights: 3,
    });

    return {
      id: mapId,
      name,
      comment,
      initialArea,
      rights: 3,
    };
  }

  async getMap(id, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }
    try {
      const map = await this.dataController('maps')
        .select('id', 'name', 'comment', 'initial_area as initialArea', 'published')
        .where('id', id)
        .first();

      if (!map) {
        throw new ApolloError(`map with id "${id}" can't be found.`, MAP_NOT_FOUND);
      }

      // Default to Brussels.
      const { initialArea = { x: 4.34878, y: 50.85045 }, ...rest } = map;
      let area = initialArea;
      if (!initialArea) {
        area = { x: 4.34878, y: 50.85045 };
      }
      return { ...rest, initialArea: { longitude: area.x, latitude: area.y } };
    } catch (e) {
      logger.warn(e);
      throw e;
    }

  }

  async uploadMap(map, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }
    const mapId = uuid();

    await this.dataController.transaction(async (trx) => {
      await trx('maps').insert({
        id: mapId,
        name: map.name,
      });

      await trx('userHasMaps').insert({
        map_id: mapId,
        user_id: decodedToken.userId,
        rights: 3,
      });

      const [templatePin] = map.templatePins;
      const templatePinId = uuid();
      await trx('template_pins').insert({
        id: templatePinId,
        fields: JSON.stringify(templatePin.fields),
        name: templatePin.name,
        map_id: mapId,
      });

      const promises = [];
      for (let i = 0; i < map.pins.length; i += 1) {
        let dbCoordinates;
        const { location: coordinates, data, name } = map.pins[i];
        if (coordinates.latitude && coordinates.longitude) {
          dbCoordinates = `(${coordinates.longitude}, ${coordinates.latitude})`;
        }

        // Make and return pin.
        promises.push(trx('pins')
          .insert({
            name,
            data: JSON.stringify(data),
            id: uuid(),
            coordinates: dbCoordinates,
            template_pin_id: templatePinId,
            map_id: mapId,
          }));
      }
      await Promise.all(promises);
    });


    return mapId;
  }

  async publishMap({ id, published }, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }

    await this.dataController('maps').update('published', published).where('id', id);

    return await this.getMap(id, decodedToken);
  }

  async getMaps({
    from = 0, limit = 10, searchField, search, sortField, sortDirection,
  }, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }
    try {
      let filteredCount;

      const query = this.dataController('maps')
        .select('maps.id', 'maps.name', 'maps.comment', 'maps.initial_area AS initialArea', 'published')
        .count('pins.id AS amountOfPins')
        .groupBy('maps.id')
        .offset(from)
        .limit(limit)
        .orderBy('name')
        .where('userHasMaps.user_id', decodedToken.userId)
        .leftOuterJoin('pins', 'maps.id', 'pins.map_id')
        .innerJoin('userHasMaps', 'maps.id', 'userHasMaps.map_id');

      if (searchField && search) {
        if (!mapFields.includes(searchField)) {
          throw new UserInputError(`The field ${searchField} does not exist in maps.`);
        }
        query.andWhere(searchField, 'like', `%${search}%`);
        const { count } = await this.dataController('maps')
          .count('maps.id')
          .where('userHasMaps.user_id', decodedToken.userId)
          .andWhere(searchField, 'like', `%${search}%`)
          .innerJoin('userHasMaps', 'maps.id', 'userHasMaps.map_id');
        filteredCount = count;
      }

      if (sortField && sortDirection) {
        if (!mapFields.includes(sortField)) {
          throw new UserInputError(`The field ${searchField} does not exist in maps.`);
        }
        query.orderBy(sortField, sortDirection);
      }

      logger.info(`Getting maps for ${decodedToken.userId}.`);
      const maps = await query;

      const { count: totalCount = 0 } = await this.dataController('maps')
        .count('maps.id')
        .where('userHasMaps.user_id', decodedToken.userId)
        .innerJoin('userHasMaps', 'maps.id', 'userHasMaps.map_id');
      return {
        items: maps.map(({ initialArea, ...rest }) => {
          let area = initialArea;
          if (!initialArea) {
            area = { x: 4.34878, y: 50.85045 };
          }
          return {
            ...rest,
            initialArea: { longitude: area.x, latitude: area.y },
          };
        }),
        totalCount,
        filteredCount: filteredCount || totalCount,
      };
    } catch (e) {
      logger.warn(e);
      throw e;
    }
  }
}

module.exports = new MapService();
