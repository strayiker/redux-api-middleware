'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

var _validation = require('./validation');

var _errors = require('./errors');

/**
 * Validate response status
 *
 * @function status
 * @access public
 * @param {object} response - A raw response object
 * @returns {Promise}
 */
function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return _Promise.resolve(response);
  } else {
    return _Promise.reject(response);
  }
}

/**
 * Extract JSON body from a server response
 *
 * @function json
 * @access public
 * @param {object} response - A raw response object
 * @returns {Promise}
 */
function json(response) {
  if (!_validation.isJSONResponse(response)) {
    return _Promise.resolve(response);
  }

  return response.json().then(function (json) {
    response.jsonData = json;
    return _Promise.resolve(response);
  });
}

/**
 * Blow up string or symbol types into full-fledged type descriptors,
 *   and add defaults
 *
 * @function normalizeTypeDescriptors
 * @access private
 * @param {Array} types - The [RSAA].types from a validated RSAA
 * @param meta - Common meta
 * @returns {Array}
 */
function normalizeTypeDescriptors(types, meta) {
  var requestType = types[0];
  var successType = types[1];
  var failureType = types[2];

  if (typeof requestType === 'string' || typeof requestType === 'symbol') {
    requestType = { type: requestType };
  }

  if (typeof successType === 'string' || typeof successType === 'symbol') {
    successType = { type: successType };
  }

  if (typeof failureType === 'string' || typeof failureType === 'symbol') {
    failureType = { type: failureType };
  }

  successType = _extends({
    payload: function payload(action, state, response) {
      return response.jsonData;
    }
  }, successType);

  failureType = _extends({
    payload: function payload(action, state, response) {
      return new _errors.ApiError(response.status, response.statusText, response.jsonData);
    }
  }, failureType);

  if (meta) {
    requestType.meta = requestType.meta || meta;
    successType.meta = successType.meta || meta;
    failureType.meta = failureType.meta || meta;
  }

  return [requestType, successType, failureType];
}

/**
 * Evaluate a type descriptor to an FSA
 *
 * @function actionWith
 * @access private
 * @param {object} descriptor - A type descriptor
 * @param {object} action - Action instance
 * @param {object} state - Current redux state
 * @param {object} response - Raw response object
 * @returns {object}
 */
function actionWith(descriptor) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var action = _ref.action;
  var state = _ref.state;
  var response = _ref.response;

  try {
    descriptor.payload = typeof descriptor.payload === 'function' ? descriptor.payload(action, state, response) : descriptor.payload;
  } catch (e) {
    descriptor.payload = new _errors.InternalError(e.message);
    descriptor.error = true;
  }

  try {
    descriptor.meta = typeof descriptor.meta === 'function' ? descriptor.meta(action, state, response) : descriptor.meta;
  } catch (e) {
    delete descriptor.meta;
    descriptor.payload = new _errors.InternalError(e.message);
    descriptor.error = true;
  }

  return descriptor;
}

exports.status = status;
exports.json = json;
exports.normalizeTypeDescriptors = normalizeTypeDescriptors;
exports.actionWith = actionWith;