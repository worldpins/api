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

    const map = await this.dataController('maps')
      .select('id', 'name', 'comment', 'initial_area as initialArea')
      .where('id', id)
      .first();

    if (!map) {
      throw new ApolloError(`map with id "${id}" can't be found.`, MAP_NOT_FOUND);
    }

    const { initialArea: { x, y }, ...rest } = map;
    return { ...rest, initialArea: { longitude: x, latitude: y } };
  }

  async getMaps({
    from = 0, limit = 10, searchField, search, sortField, sortDirection,
  }, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }

    let filteredCount;

    const query = this.dataController('maps')
      .select('maps.id', 'maps.name', 'maps.comment', 'maps.initial_area AS initialArea')
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
      items: maps.map(({ initialArea: { x, y }, ...rest }) =>
        ({ ...rest, initialArea: { longitude: x, latitude: y } })),
      totalCount,
      filteredCount: filteredCount || totalCount,
    };
  }
}

module.exports = new MapService();
