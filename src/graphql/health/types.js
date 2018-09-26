const healthTypes = `
  type Ping {
    pong: String!
  }

  extend type Query {
    ping: Ping
  }
`;

module.exports = healthTypes;
