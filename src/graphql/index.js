const Koa = require('koa');
const { ApolloServer } = require('apollo-server-koa');

const { makeLogger } = require('../utils/logger');
const { getAuthToken, tokenRefresher } = require('../web/authMiddleware');
const { verifyAuthToken } = require('../utils/tokenizer');
const makeSchema = require('./schema');

const log = makeLogger('GraphQL Server');

async function makeServer() {
  log.info('Setting up apollo server.');
  const schema = makeSchema();
  const server = new ApolloServer({
    context: async ({ ctx }) => {
      const { request: { header: headers } } = ctx;
      let token = getAuthToken(headers.authorization || '');
      if (!token) {
        return { token };
      }
      let decodedToken;
      try {
        decodedToken = await verifyAuthToken(token);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          token = await tokenRefresher(token);
          decodedToken = await verifyAuthToken(token);
        }
      }
      return { token: decodedToken, undecodedToken: token };
    },
    formatError: (error) => {
      const { stacktrace } = error.extensions.exception;
      // Remove the verbose "Error:" prefix.
      stacktrace.shift();
      // Log it so we can see it when a user has an error.
      log.error(`${(error.extensions && error.extensions.code) || 'Internal Server Error: '}: ${error.message}\n${stacktrace.join('\n')}`);
      return error;
    },
    schema,
  });
  const app = new Koa();
  server.applyMiddleware({ app });
  log.info('Succesfully set up apollo server.');
  return app;
}

module.exports = makeServer;
