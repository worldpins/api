const mapService = require('../../services/mapService');

const mapResolvers = {
  Query: {
    maps: async (obj, args, { token }) => mapService.getMaps(args, token),
    map: async (obj, { id }, { token }) => mapService.getMap(id, token),
  },
  Mutation: {
    createMap: async (obj, { input }, { token }) => mapService.createMap(input, token),
  },
};

module.exports = mapResolvers;
