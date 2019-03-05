const dataController = require('../data');
// const { makeLogger } = require('../utils/logger');
const uuid = require('uuid/v4');

// TODO: log
// const logger = makeLogger('pinService');

// const pinFields = ['id', 'name', 'coordinates', 'comment', 'data'];

class MapService {
  constructor() {
    this.dataController = dataController.knex;
  }

  async getTemplatePinsForMap(mapId) {
    return this.dataController('template_pins')
      .select('id', 'name', 'comment', 'fields')
      .where('map_id', mapId);
  }

  async getPinsForMap(mapId) {
    const pins = await this.dataController('pins')
      .select('pins.id', 'pins.name', 'pins.coordinates', 'pins.comment', 'pins.data')
      .where('pins.map_id', mapId);
    return pins.map(({ coordinates, ...rest }) => ({
      ...rest,
      location: {
        latitude: coordinates && coordinates.y,
        longitude: coordinates && coordinates.x,
      },
    }));
  }

  async createTemplatePin(mapId, { fields, name, comment }) {
    // Make and return pin.
    return this.dataController('template_pins')
      .insert({
        id: uuid(),
        fields: JSON.stringify(fields),
        name,
        comment,
        map_id: mapId,
      });
  }

  async getPin(id, decodedToken) {
    if (!decodedToken) {
      throw new AuthenticationError('Must authenticate.');
    }

    const pin = await this.dataController('pin')
      .select('pins.id', 'pins.name', 'pins.comment', 'pins.coordinates', 'pins.data',)
      .where('id', id)
      .first();

    if (!pin) {
      throw new ApolloError(`map with id "${id}" can't be found.`, MAP_NOT_FOUND);
    }

    return {
      ...pin,
      location: {
        latitude: pin.coordinates && coordinates.y,
        longitude: pin.coordinates && coordinates.x,
      },
    };
  }

  async createTemplatePin(mapId, {
 id, fields, name, comment 
}) {
    // Make and return pin.
    return this.dataController('template_pins')
      .update({
        fields: JSON.stringify(fields),
        name,
        comment,
        map_id: mapId,
      }).where('id', id);
  }

  async updatePin(mapId, {
 id, coordinates, templatePinId, ...rest 
}) {
    // Prepare coordinates.
    let dbCoordinates;
    if (coordinates.latitude && coordinates.longitude) {
      dbCoordinates = `(${coordinates.longitude}, ${coordinates.latitude})`;
    }

    // Make and return pin.
    return this.dataController('pins')
      .update({
        ...rest,
        id: uuid(),
        coordinates: dbCoordinates,
        template_pin_id: templatePinId,
        map_id: mapId,
      }).where('id', id);
  }

  async createPin(mapId, { coordinates, templatePinId, ...rest }) {
    // Prepare coordinates.
    let dbCoordinates;
    if (coordinates.latitude && coordinates.longitude) {
      dbCoordinates = `(${coordinates.longitude}, ${coordinates.latitude})`;
    }

    // Make and return pin.
    return this.dataController('pins')
      .insert({
        ...rest,
        id: uuid(),
        coordinates: dbCoordinates,
        template_pin_id: templatePinId,
        map_id: mapId,
      });
  }
}

module.exports = new MapService();
