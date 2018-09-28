const dataController = require('../data');
// const { makeLogger } = require('../utils/logger');

// const logger = makeLogger('mapService');

class MapService {
  constructor() {
    this.dataController = dataController.knex;
  }
}

module.exports = new MapService();
