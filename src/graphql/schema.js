const { makeExecutableSchema } = require('graphql-tools');
const merge = require('lodash.merge');

const { makeLogger } = require('../utils/logger');
const healthTypes = require('./health/types');
const healthResolvers = require('./health/resolvers');
const authTypes = require('./authentication/types');
const authResolvers = require('./authentication/resolvers');

const log = makeLogger('schema');

const schemaTypeDefs = `
  schema {
    query: Query
    mutation: Mutation
  }
`;

function makeSchema() {
  log.info('Generating schema');
  return makeExecutableSchema({
    typeDefs: [authTypes, healthTypes, schemaTypeDefs],
    resolvers: merge(authResolvers, healthResolvers),
  });
}

module.exports = makeSchema;
