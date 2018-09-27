const bcrypt = require('bcryptjs');
const config = require('config');
const { makeLogger } = require('./logger');

const logger = makeLogger('PWHasher');

const PW_SALT = config.get('password.salt');

exports.hash = function hash(string) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(string, PW_SALT, (err, stringHash) => {
      if (err) {
        logger.warn(`PW HASH FAILED ${err}`);
        return reject(err);
      }
      return resolve(stringHash);
    });
  });
};

exports.checkPw = function checkPw(password, pwhash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, pwhash, (err, res) => {
      if (err) {
        logger.info(`CHECK PW FAILED ${err}`);
        return reject(err);
      }
      return resolve(res);
    });
  });
};
