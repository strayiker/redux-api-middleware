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

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _RSAA = require('./RSAA');

var _RSAA2 = _interopRequireDefault(_RSAA);

var _validation = require('./validation');

var _errors = require('./errors');

var _util = require('./util');

var _middleware = require('./middleware');

exports.RSAA = _RSAA2['default'];
exports.isRSAA = _validation.isRSAA;
exports.isJSONResponse = _validation.isJSONResponse;
exports.validateRSAA = _validation.validateRSAA;
exports.isValidRSAA = _validation.isValidRSAA;
exports.InvalidRSAA = _errors.InvalidRSAA;
exports.InternalError = _errors.InternalError;
exports.RequestError = _errors.RequestError;
exports.ApiError = _errors.ApiError;
exports.status = _util.status;
exports.json = _util.json;
exports.apiMiddleware = _middleware.apiMiddleware;