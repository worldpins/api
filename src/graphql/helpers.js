const { getAuthToken, tokenRefresher } = require('../web/authMiddleware');
const { verifyAuthToken } = require('../utils/tokenizer');

exports.authMiddleware = async ({ ctx }) => {
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
      ctx.set('authorization', `bearer ${token}`);
      decodedToken = await verifyAuthToken(getAuthToken(token));
    }
  }
  return { token: decodedToken, undecodedToken: token };
};

exports.formatError = (log, error) => {
  const { stacktrace } = error.extensions.exception;
  // Remove the verbose "Error:" prefix.
  stacktrace.shift();
  // Log it so we can see it when a user has an error.
  log.error(`${(error.extensions && error.extensions.code) || 'Internal Server Error: '}: ${error.message}\n${stacktrace.join('\n')}`);
  return error;
};
