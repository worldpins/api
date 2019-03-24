const mapService = require('../../services/mapService');

const mapResolvers = {
  Query: {
    publicMaps: async (obj, args) => mapService.getPublicMaps(args),
  },
};

module.exports = mapResolvers;
