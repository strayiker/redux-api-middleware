'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _lodashIsempty = require('lodash.isempty');

var _lodashIsempty2 = _interopRequireDefault(_lodashIsempty);

var _errors = require('./errors');

function getJson(response) {
  if (!_lodashIsempty2['default'](response.body)) {
    return response.body;
  }
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
  var abortType = types[3];

  if (typeof requestType === 'string' || typeof requestType === 'symbol') {
    requestType = { type: requestType };
  }

  if (typeof successType === 'string' || typeof successType === 'symbol') {
    successType = { type: successType };
  }

  if (typeof failureType === 'string' || typeof failureType === 'symbol') {
    failureType = { type: failureType };
  }

  if (typeof abortType === 'string' || typeof abortType === 'symbol') {
    abortType = { type: abortType };
  }

  successType = _extends({
    payload: function payload(action, state, response) {
      return getJson(response);
    }
  }, successType);

  failureType = _extends({
    payload: function payload(action, state, response, error) {
      if (response) {
        return new _errors.ApiError(response.status, response.statusText, getJson(response));
      }
      return new _errors.RequestError(error.toString());
    }
  }, failureType);

  if (meta) {
    requestType.meta = requestType.meta || meta;
    successType.meta = successType.meta || meta;
    failureType.meta = failureType.meta || meta;
    abortType.meta = abortType.meta || meta;
  }

  return [requestType, successType, failureType, abortType];
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
 * @param {object} error - Error object
 * @returns {object}
 */
function actionWith(descriptor) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var action = _ref.action;
  var state = _ref.state;
  var response = _ref.response;
  var error = _ref.error;

  try {
    descriptor.payload = typeof descriptor.payload === 'function' ? descriptor.payload(action, state, response, error) : descriptor.payload;
  } catch (e) {
    descriptor.payload = new _errors.InternalError(e.message);
    descriptor.error = true;
  }

  try {
    descriptor.meta = typeof descriptor.meta === 'function' ? descriptor.meta(action, state, response, error) : descriptor.meta;
  } catch (e) {
    delete descriptor.meta;
    descriptor.payload = new _errors.InternalError(e.message);
    descriptor.error = true;
  }

  return descriptor;
}

exports.getJson = getJson;
exports.normalizeTypeDescriptors = normalizeTypeDescriptors;
exports.actionWith = actionWith;