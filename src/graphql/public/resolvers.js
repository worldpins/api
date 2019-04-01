const mapService = require('../../services/mapService');

const mapResolvers = {
  Query: {
    publicMaps: async (obj, args) => mapService.getPublicMaps(args),
    publicMap: async (obj, args) => mapService.getPublicMap(args.id),
  },
};

module.exports = mapResolvers;
