const koaConvert = require('koa-convert');
const koaBodyParser = require('koa-bodyparser');
const koaHelmet = require('koa-helmet');
const koaCors = require('koa-cors');

function makeEnableCorsMiddleware() {
  // Adds CORS header middleware
  const options = {
    origin: true,
    headers: ['Accept-Ranges', 'Content-Encoding', 'Content-Type', 'Content-Length', 'Content-Range', 'Range', 'authorization'],
    expose: ['Accept-Ranges', 'Content-Encoding', 'Content-Type', 'Content-Length', 'Content-Range', 'Range', 'authorization'],
  };
  return koaConvert(koaCors(options));
}

function makeErrorResponderMiddleware(exposeStack) {
  return async (ctx, next) => {
    try {
      // Process request
      try {
        await next();
      } catch (err) {
        // if it's a HTTP error, throw as-is
        if (err.status) throw err;
        // Translate all non-HTTP errors to 500's. Maintain the stack of the inner error.
        ctx.throw(500, 'Internal server error', { code: 'INTERNAL_SERVER_ERROR', stack: err.stack });
      }
      // If something was returned by now, stop here.
      if (ctx.status !== 404) { return; }
      // Create 404 error
      ctx.throw(404, 'Resource not found', { code: 'NOT_FOUND' });
    } catch (err) {
      // Note: err certainly is a HttpError (https://github.com/jshttp/http-errors)
      ctx.status = err.status;
      ctx.body = {
        ...err,
        stack: !exposeStack ? undefined : err.stack.split('\n', 3).join('\n'),
      };
    }
  };
}

/**
 * Gets the auth token from the authorization header in given request objects,
 * by stripping the schema (which should be 'bearer') from it's value and
 * returning the rest.
 *
 * @param {Object} ctx - A Koa request context
 *
 * @returns {?string} Returns null if no valid authorization header is present,
 * returns the header value (without schema) otherwise.
 */
function makeAuthTokenExtractorMiddleware() {
  return async (ctx, next) => {
    // Get the authorization header from the request object
    const authorizationHeader = ctx.headers.authorization;
    if (!authorizationHeader) {
      return next();
    }
    // The header should be of the format "bearer <auth-token>". Strip
    // the first part.
    const parts = authorizationHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return next();
    }
    // The second part should contain the auth token. Append to the Koa context
    const authToken = parts[1];
    ctx.authToken = authToken;
    return next();
  };
}

function makeInstallRespondMiddleware() {
  return async (ctx, next) => {
    ctx.respond = (status, body) => {
      ctx.status = status;
      ctx.body = body;
    };

    await next();
  };
}

/**
 * This function does the following:
 * - Install default middlewares for enabling CORS, body parsing and security (helmet).
 * - Installs a logger, logging requests and error responses.
 * - Sets ctx.logger, ctx.authToken, ctx.fetcher and ctx.validate.
 * - Adds a translator for boom thrown errors to responses, and an eater, avoiding Koa to throw
 *   when a request handler throws something.
 * @param app
 * @param exposeStack
 * @param logger
 */
module.exports = function installCodiflyMiddleware(app, exposeStack) {
  // Add basic middlewares
  app.use(makeEnableCorsMiddleware());
  app.use(koaBodyParser());
  app.use(koaHelmet());
  // Add our custom middleware
  app.use(makeErrorResponderMiddleware(exposeStack));
  app.use(makeAuthTokenExtractorMiddleware());
  app.use(makeInstallRespondMiddleware());
};
