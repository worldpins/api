const mapService = require('../../services/mapService');
const pinService = require('../../services/pinService');

const mapResolvers = {
  Query: {
    maps: async (obj, args, { token }) => mapService.getMaps(args, token),
    map: async (obj, { id }, { token }) => mapService.getMap(id, token),
  },
  Map: {
    async pins(map, args, { token }) {
      const pins = await pinService.getPinsForMap(map.id, token);
      console.log('RESULT', pins);
      return pins;
    },
  },
  Mutation: {
    createMap: async (obj, { input }, { token }) => mapService.createMap(input, token),
    map: async (obj, { id }, { token }) => mapService.getMap(id, token),
  },
  MutationMap: {
    async createPin(map, { input: pin }) {
      return pinService.createPin(map.id, pin);
    },
  },
};

module.exports = mapResolvers;
