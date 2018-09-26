const bcrypt = require('bcryptjs');
const config = require('config');

const PW_SALT = config.get('password.salt');

exports.hash = function hash(string, logger = null) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(string, PW_SALT, (err, stringHash) => {
      if (err) {
        if (logger) logger.log('warn', 'PW HASH FAILED', err);
        return reject(err);
      }
      return resolve(stringHash);
    });
  });
};

exports.checkPw = function checkPw(password, pwhash, logger = null) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, pwhash, (err, res) => {
      if (err) {
        if (logger) logger.log('info', 'CHECK PW FAILED', err);
        return reject(err);
      }
      return resolve(res);
    });
  });
};
