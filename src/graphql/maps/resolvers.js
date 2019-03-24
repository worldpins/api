const mapService = require('../../services/mapService');
const pinService = require('../../services/pinService');

const mapResolvers = {
  Query: {
    maps: async (obj, args, { token }) => mapService.getMaps(args, token),
    map: async (obj, { id }, { token }) => mapService.getMap(id, token),
    pin: async (obj, { id }, { token }) => pinService.getPin(id, token),
  },
  Map: {
    async pins(map, args, { token }) {
      return pinService.getPinsForMap(map.id, token);
    },
    async templatePins(map, args, { token }) {
      return pinService.getTemplatePinsForMap(map.id, token);
    },
  },
  Mutation: {
    createMap: async (obj, { input }, { token }) => mapService.createMap(input, token),
    map: async (obj, { id }, { token }) => mapService.getMap(id, token),
    uploadMap: async (obj, { map }, { token }) => mapService.uploadMap(map, token),
  },
  MutationMap: {
    async updateMap(map, { input: mapInput }, { token }) {
      return mapService.publishMap({ id: map.id, published: mapInput.published }, token);
    },
    async createPin(map, { input: pin }) {
      return pinService.createPin(map.id, pin);
    },
    async updatePin(map, { input: pin }) {
      return pinService.updatePin(map.id, pin);
    },
    async createTemplatePin(map, { input: templatePin }) {
      return pinService.createTemplatePin(map.id, templatePin);
    },
    async updateTemplatePin(map, { input: templatePin }) {
      return pinService.updateTemplatePin(map.id, templatePin);
    },
  },
};

module.exports = mapResolvers;
