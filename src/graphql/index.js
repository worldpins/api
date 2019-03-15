const Koa = require('koa');
const { ApolloServer } = require('apollo-server-koa');

const { makeLogger } = require('../utils/logger');
const { authMiddleware, formatError } = require('./helpers');
const makeSchema = require('./schema');

const log = makeLogger('GraphQL Server');

async function makeServer() {
  log.info('Setting up apollo server.');
  const schema = makeSchema();
  const server = new ApolloServer({
    context: authMiddleware,
    formatError: formatError.bind(this, log),
    schema,
  });
  const app = new Koa();
  server.applyMiddleware({ app, cors: true });
  log.info('Succesfully set up apollo server.');
  return app;
}

module.exports = makeServer;
