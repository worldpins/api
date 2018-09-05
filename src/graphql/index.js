const Koa = require('koa');
const { ApolloServer } = require('apollo-server-koa');

const { makeLogger } = require('../utils/logger');
const makeSchema = require('./schema');

const log = makeLogger('GraphQL Server');

async function makeServer() {
  log.info('Setting up apollo server.');
  const schema = makeSchema();
  const server = new ApolloServer({ schema });
  const app = new Koa();
  server.applyMiddleware({ app });
  log.info('Succesfully set up apollo server.');
  return app;
}

module.exports = makeServer;
