const config = require('config');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const AUTH_TOKEN_SECRET = config.get('token.secret');
const AUTH_TOKEN_ISSUER = config.get('token.issuer');
const AUTH_TOKEN_AUDIENCE = config.get('token.audience');

/**
 * @description Helper function that makes a call to a given refresh endpoint with an old token
 * and returns the new token.
 */
const tokenRefresher = async (endpoint, oldAuthToken, ctx) => {
  // TODO: make graphql fetch
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${oldAuthToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const responseBody = await response.json();
  if (response.status !== 200) {
    ctx.throw(response.status, responseBody.message);
  }
  return responseBody.authToken;
};

/**
 * @description Function that gets the auth token from the 'authorization' header in
 * a given ctx object by stripping the schema (which should be 'bearer') from it's value and
 * returning the rest.
 * The auth token can also be passed through query params. The field is called 'authToken' and
 * should not be prefixed with 'bearer'.
 *
 * @param {Object} ctx - A Koa request context
 *
 * @returns {?string} Returns null if no valid authorization header is present,
 * returns the header value (without schema) otherwise.
 */
exports.getAuthToken = (authorizationHeader) => {
  // Get the authorization header from the request object
  if (authorizationHeader) {
    // The header should be of the format "bearer <auth-token>". Strip
    // the first part.
    const parts = authorizationHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }
    // The second part should contain the auth token.
    return parts[1];
  }
  return null;
};

/**
 * @description Requires an authenticated user (valid auth token), and sets request.session
 * (with the authToken and all token contents) on the Koa context.
 */
exports.authMiddleWare = async (ctx, next) => {
  // Get the token from the request headers
  let authToken = exports.getAuthToken(ctx);
  if (!authToken) {
    ctx.throw(401, 'Invalid auth token');
    // throw boom.forbidden('Invalid auth token', { type: 'INVALID_AUTH_TOKEN' });
  }
  // Decode and validate the token. Get a renewed token if necessary.
  let decodedToken;
  const decodeOptions = {
    audience: AUTH_TOKEN_AUDIENCE,
    issuer: AUTH_TOKEN_ISSUER,
  };
  try {
    decodedToken = jwt.verify(authToken, AUTH_TOKEN_SECRET, decodeOptions);
  } catch (err) {
    // Some error we can't solve? :(
    if (err.name !== 'TokenExpiredError') {
      ctx.throw(401, 'Token expired.');
    }
    // Token expired error, we can try to solve that one! If this fails, we'll
    // throw the error, which will in it's turn be sent to the client.
    // If it went well, set authToken and decodedToken as like nothing happened.
    authToken = await tokenRefresher(`${ctx.request.origin}/api/account/refresh`, authToken, ctx);
    decodedToken = jwt.verify(authToken, AUTH_TOKEN_SECRET, decodeOptions);
    // Include new token in response header
    ctx.set('authorization', `Bearer ${authToken}`);
  }
  // Done. Attach session data to the Koa context and continue
  ctx.state.session = Object.assign({}, { authToken }, decodedToken);
  await next();
};

