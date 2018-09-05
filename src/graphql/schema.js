const { makeExecutableSchema } = require('graphql-tools');
const merge = require('lodash.merge');

const { makeLogger } = require('../utils/logger');
const Health = require('./health/types');
const healthResolvers = require('./health/resolvers');

const log = makeLogger('schema');

function makeSchema() {
  log.info('Generating schema');
  return makeExecutableSchema({
    typeDefs: [Health],
    resolvers: merge(healthResolvers),
  });
}

module.exports = makeSchema;
