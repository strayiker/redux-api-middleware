/**
 * Redux middleware for calling an API
 * @module redux-api-middleware
 * @requires isomorphic-fetch
 * @requires lodash.isplainobject
 * @exports {string} RSAA
 * @exports {function} isRSAA
 * @exports {function} validateRSAA
 * @exports {function} isValidRSAA
 * @exports {error} InvalidRSAA
 * @exports {error} InternalError
 * @exports {error} RequestError
 * @exports {error} ApiError
 * @exports {function} getJSON
 * @exports {ReduxMiddleWare} apiMiddleware
 */

/**
 * @typedef {function} ReduxMiddleware
 * @param {object} store
 * @returns {ReduxNextHandler}
 *
 * @typedef {function} ReduxNextHandler
 * @param {function} next
 * @returns {ReduxActionHandler}
 *
 * @typedef {function} ReduxActionHandler
 * @param {object} action
 * @returns undefined
 */

import RSAA from './RSAA';
import { isJSONResponse, isRSAA, validateRSAA, isValidRSAA } from './validation';
import { InvalidRSAA, InternalError, RequestError, ApiError } from './errors';
import { status, json } from './util';
import { apiMiddleware } from './middleware';

export {
  RSAA,
  isRSAA,
  isJSONResponse,
  validateRSAA,
  isValidRSAA,
  InvalidRSAA,
  InternalError,
  RequestError,
  ApiError,
  apiMiddleware
};
