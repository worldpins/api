// const mapService = require('../../services/mapService');

const mapResolvers = {
  Query: {
    maps: () => ({ pong: 'Dong' }),
    map: () => ({ pong: 'Dong' }),
  },
  Mutation: {
    createMap: () => ({ pong: 'Dong' }),
  },
};

module.exports = mapResolvers;
