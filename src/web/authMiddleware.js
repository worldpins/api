const config = require('config');
const fetch = require('node-fetch');
const { ApolloError } = require('apollo-server-koa');

const SERVER_ORIGIN = config.get('server.origin');

const refreshTokenMutation = '{ refreshToken { authToken } }';

exports.tokenRefresher = async (oldAuthToken) => {
  const response = await fetch(SERVER_ORIGIN, {
    body: JSON.stringify({ mutation: refreshTokenMutation }),
    headers: {
      Authorization: `bearer ${oldAuthToken}`,
      'Content-Type': 'application/graphql',
    },
    method: 'POST',
  });
  const responseBody = await response.json();
  if (response.status !== 200) {
    throw new ApolloError(responseBody.message, 'REFRESH_TOKEN_FAILED');
  }
  return responseBody.refreshToken.authToken;
};

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

