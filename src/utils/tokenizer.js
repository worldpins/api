const config = require('config');
const jwt = require('jsonwebtoken');

const { makeLogger } = require('./logger');

const TOKEN_SECRET = config.get('token.secret');
const TOKEN_EXPIRATION = config.get('token.expiration');
const TOKEN_ISSUER = config.get('token.issuer');
const TOKEN_AUDIENCE = config.get('token.audience');

const logger = makeLogger('Tokenizer');

function logToken(token) {
  return `${token.substr(0, 4)}...${token.substr(-4)}`;
}

exports.makeAuthToken = function makeAuthToken(userId, userRoles = []) {
  const tokenData = {
    refreshExpiresIn: Math.floor((Date.now() + TOKEN_EXPIRATION)),
    userId,
    userRoles,
  };
  // Options, setting reserved claims in the JWT
  const signOptions = {
    audience: TOKEN_AUDIENCE,
    expiresIn: Math.floor(TOKEN_EXPIRATION),
    issuer: TOKEN_ISSUER,
    subject: 'auth',
  };
  // Create the token given data and options defined above.
  return new Promise((resolve, reject) => {
    jwt.sign(tokenData, TOKEN_SECRET, signOptions, (err, t) => {
      if (err) {
        if (logger) logger.error(`Could not sign auth token ${err}`);
        return reject(err);
      }
      if (logger) logger.info('info', `Signed new auth token: ${logToken(t)}`);
      return resolve(t);
    });
  });
};

exports.verifyAuthToken = function verifyToken(token, options = {}) {
  return new Promise((resolve, reject) => {
    const jwtOptions = { audience: TOKEN_AUDIENCE, issuer: TOKEN_ISSUER, subject: 'auth' };
    if (options.forRefresh) { jwtOptions.ignoreExpiration = true; }
    // Verify the token without audience check
    jwt.verify(token, TOKEN_SECRET, jwtOptions, (err, decodedToken) => {
      if (err) {
        if (logger) logger.warn(`Could not verify auth token ${err}`);
        return reject(err);
      }
      // When forRefresh is true, check whether we've passed the refresh interval.
      // In that case, consider the token invalid.
      if (options.forRefresh
          && Math.floor(Date.now() / 1000) >= decodedToken.refreshExpiresIn) {
        const err2 = new jwt.TokenExpiredError(
          'jwt refresh interval expired',
          new Date(decodedToken.refreshExpiresIn * 1000)
        );
        if (logger) logger.warn(`Could not verify auth token ${err2}`);
        return reject(err2);
      }
      // Valid token.
      return resolve({
        issuedAt: decodedToken.issuedAt,
        userId: decodedToken.userId,
        userRoles: decodedToken.userRoles,
      });
    });
  });
};
