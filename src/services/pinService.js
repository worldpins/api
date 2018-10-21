const dataController = require('../data');
const { makeLogger } = require('../utils/logger');

const logger = makeLogger('pinService');

const pinFields = ['id', 'name', 'coordinates', 'comment', 'data'];

class MapService {
  constructor() {
    this.dataController = dataController.knex;
  }

  async getPinsForMap(mapId) {
    return this.dataController('pins')
      .select('pins.id', 'pins.name', 'pins.coordinates', 'pins.comment', 'pins.data')
      .where('pins.map_id', mapId);
  }
}

module.exports = new MapService();
