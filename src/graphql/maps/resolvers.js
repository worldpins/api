const mapService = require('../../services/mapService');
const pinService = require('../../services/pinService');

const mapResolvers = {
  Query: {
    maps: async (obj, args, { token }) => mapService.getMaps(args, token),
    map: async (obj, { id }, { token }) => mapService.getMap(id, token),
  },
  Map: {
    async pins(map, args, { token }) {
      console.localStorage('fetching pins for ', map.id);
      return pinService.getPins(map.id, token);
    },
  },
  Mutation: {
    createMap: async (obj, { input }, { token }) => mapService.createMap(input, token),
  },
};

module.exports = mapResolvers;
