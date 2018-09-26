// This will be the gatherpoint for our migrations and optional seeding.
const knexConstructor = require('knex');
const config = require('config');

const { makeLogger } = require('../utils/logger');

const logger = makeLogger('db-connect');

class DbInstance {
  constructor() {
    try {
      this.knex = knexConstructor({
        client: 'pg',
        connection: {
          host: config.get('database.host'),
          database: config.get('database.name'),
          password: config.get('database.password'),
          user: config.get('database.user'),
        },
        migrations: {
          directory: './src/data/migrations',
        },
      });
    } catch (e) {
      logger.error(`Fail connection ${e}`);
      process.exit(1);
    }
  }

  async migrate() {
    await this.knex.migrate.latest();
  }
}

exports.knex = DbInstance;
module.exports = new DbInstance();
