const config = require('config');

const makeServer = require('./src/graphql');
const { configureLogger, makeLogger } = require('./src/utils/logger');
const dataController = require('./src/data');

configureLogger();

const PORT = config.get('server.port');
const IP = config.get('server.ip');
const { NODE_ENV } = process.env;
const log = makeLogger('server');

async function startApplication() {
  try {
    await dataController.migrate();
    const app = await makeServer();
    app.listen(PORT, IP, () => {
      log.info('info', `Server listening on ${IP}:${PORT} in ${NODE_ENV} mode`);
    });
  } catch (e) {
    log.error('error', `Error while starting up server: ${e}`);
    process.exit(1);
  }
}

startApplication();
