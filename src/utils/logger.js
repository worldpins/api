const log4js = require('log4js');

exports.configureLogger = function configureLogger() {
  log4js.configure({
    appenders: { out: { type: 'stdout' } },
    categories: { default: { appenders: ['out'], level: 'info' } },
  });
};

exports.makeLogger = function makeLogger(name) {
  return log4js.getLogger(name);
};
