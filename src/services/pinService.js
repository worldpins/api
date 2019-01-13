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
    const query = this.dataController('template_pins')
      .insert({
        id: uuid(),
        fields: JSON.stringify(fields),
        name,
        comment,
        map_id: mapId,
      });
    console.log(query.toQuery());
  }

  async createPin(mapId, { coordinates, template, ...rest }) {
    // Prepare coordinates.
    let dbCoordinates;
    if (coordinates.latitude && coordinates.longitude) {
      dbCoordinates = `(${coordinates.longitude}, ${coordinates.latitude})`;
    }

    // Create template if needed.
    let templateId;
    if (template) {
      templateId = uuid();
      await this.dataController('template_pins')
        .insert({ ...template, id: templateId });
    }

    // Make and return pin.
    return this.dataController('pins')
      .insert({
        ...rest,
        id: uuid(),
        coordinates: dbCoordinates,
        template_pins_id: templateId,
        map_id: mapId,
      });
  }
}

module.exports = new MapService();
