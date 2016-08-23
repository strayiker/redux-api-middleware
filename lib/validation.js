'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _RSAA = require('./RSAA');

var _RSAA2 = _interopRequireDefault(_RSAA);

var _lodashIsplainobject = require('lodash.isplainobject');

var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);

/**
 * Is the given action a plain JavaScript object with an [RSAA] property?
 *
 * @function isRSAA
 * @access public
 * @param {object} action - The action to check
 * @returns {boolean}
 */
function isRSAA(action) {
  return _lodashIsplainobject2['default'](action) && action.hasOwnProperty(_RSAA2['default']);
}

/**
 * Is the given object a valid type descriptor?
 *
 * @function isValidTypeDescriptor
 * @access private
 * @param {object} obj - The object to check agains the type descriptor definition
 * @returns {boolean}
 */
function isValidTypeDescriptor(obj) {
  var validKeys = ['type', 'payload', 'request', 'meta'];

  if (!_lodashIsplainobject2['default'](obj)) {
    return false;
  }

  for (var _iterator = _Object$keys(obj), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var key = _ref;

    if (! ~validKeys.indexOf(key)) {
      return false;
    }
  }

  if (!('type' in obj)) {
    return false;
  }

  return !(typeof obj.type !== 'string' && typeof obj.type !== 'symbol');
}

/**
 * Checks an action against the RSAA definition, returning a (possibly empty)
 * array of validation errors.
 *
 * @function validateRSAA
 * @access public
 * @param {object} action - The action to check against the RSAA definition
 * @returns {Array}
 */
function validateRSAA(action) {
  var validCallAPIKeys = ['endpoint', 'method', 'body', 'headers', 'credentials', 'bailout', 'types', 'onRequest', 'onSuccess', 'onFailure'];
  var validMethods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
  var validCredentials = ['omit', 'same-origin', 'include'];

  var validationErrors = [];

  if (!isRSAA(action)) {
    validationErrors.push('RSAAs must be plain JavaScript objects with an [RSAA] property');
    return validationErrors;
  }

  for (var _iterator2 = _Object$keys(action), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    var key = _ref2;

    if (key !== _RSAA2['default']) {
      validationErrors.push('Invalid root key: ' + key);
    }
  }

  var callAPI = action[_RSAA2['default']];

  if (!_lodashIsplainobject2['default'](callAPI)) {
    validationErrors.push('[RSAA] property must be a plain JavaScript object');
  }

  for (var _iterator3 = _Object$keys(callAPI), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _getIterator(_iterator3);;) {
    var _ref3;

    if (_isArray3) {
      if (_i3 >= _iterator3.length) break;
      _ref3 = _iterator3[_i3++];
    } else {
      _i3 = _iterator3.next();
      if (_i3.done) break;
      _ref3 = _i3.value;
    }

    var key = _ref3;

    if (! ~validCallAPIKeys.indexOf(key)) {
      validationErrors.push('Invalid [RSAA] key: ' + key);
    }
  }

  var endpoint = callAPI.endpoint;
  var method = callAPI.method;
  var headers = callAPI.headers;
  var credentials = callAPI.credentials;
  var types = callAPI.types;
  var bailout = callAPI.bailout;
  var onRequest = callAPI.onRequest;
  var onSuccess = callAPI.onSuccess;
  var onFailure = callAPI.onFailure;

  if (typeof endpoint === 'undefined') {
    validationErrors.push('[RSAA] must have an endpoint property');
  } else if (typeof endpoint !== 'string' && typeof endpoint !== 'function') {
    validationErrors.push('[RSAA].endpoint property must be a string or a function');
  }

  if (typeof method === 'undefined') {
    validationErrors.push('[RSAA] must have a method property');
  } else if (typeof method !== 'string') {
    validationErrors.push('[RSAA].method property must be a string');
  } else if (! ~validMethods.indexOf(method.toUpperCase())) {
    validationErrors.push('Invalid [RSAA].method: ' + method.toUpperCase());
  }

  if (typeof headers !== 'undefined' && !_lodashIsplainobject2['default'](headers) && typeof headers !== 'function') {
    validationErrors.push('[RSAA].headers property must be undefined, a plain JavaScript object, or a function');
  }

  if (typeof credentials !== 'undefined') {
    if (typeof credentials !== 'string') {
      validationErrors.push('[RSAA].credentials property must be undefined, or a string');
    } else if (! ~validCredentials.indexOf(credentials)) {
      validationErrors.push('Invalid [RSAA].credentials: ' + credentials);
    }
  }

  if (typeof bailout !== 'undefined' && typeof bailout !== 'boolean' && typeof bailout !== 'function') {
    validationErrors.push('[RSAA].bailout property must be undefined, a boolean, or a function');
  }

  if (typeof types === 'undefined') {
    validationErrors.push('[RSAA] must have a types property');
  } else if (!Array.isArray(types) || types.length !== 3) {
    validationErrors.push('[RSAA].types property must be an array of length 3');
  } else {
    var requestType = types[0];
    var successType = types[1];
    var failureType = types[2];

    if (typeof requestType !== 'string' && typeof requestType !== 'symbol' && !isValidTypeDescriptor(requestType)) {
      validationErrors.push('Invalid request type');
    }
    if (typeof successType !== 'string' && typeof successType !== 'symbol' && !isValidTypeDescriptor(successType)) {
      validationErrors.push('Invalid success type');
    }
    if (typeof failureType !== 'string' && typeof failureType !== 'symbol' && !isValidTypeDescriptor(failureType)) {
      validationErrors.push('Invalid failure type');
    }
  }

  if (typeof onRequest !== 'undefined' && typeof onRequest !== 'function') {
    validationErrors.push('[RSAA].onRequest property must be a function, or undefined');
  }

  if (typeof onSuccess !== 'undefined' && typeof onSuccess !== 'function') {
    validationErrors.push('[RSAA].onSuccess property must be a function, or undefined');
  }

  if (typeof onFailure !== 'undefined' && typeof onFailure !== 'function') {
    validationErrors.push('[RSAA].onFailure property must be a function, or undefined');
  }

  return validationErrors;
}

/**
 * Is the given action a valid RSAA?
 *
 * @function isValidRSAA
 * @access public
 * @param {object} action - The action to check against the RSAA definition
 * @returns {boolean}
 */
function isValidRSAA(action) {
  return !validateRSAA(action).length;
}

/**
 * Validate request content type and code
 *
 * @function isJSONResponse
 * @access public
 * @param {object} res - A raw response object
 * @returns {bool}
 */
function isJSONResponse(res) {
  var contentType = res.headers.get('Content-Type');
  var emptyCodes = [204, 205];

  return ! ~emptyCodes.indexOf(res.status) && contentType && ~contentType.indexOf('json');
}

exports.isRSAA = isRSAA;
exports.isValidTypeDescriptor = isValidTypeDescriptor;
exports.validateRSAA = validateRSAA;
exports.isValidRSAA = isValidRSAA;
exports.isJSONResponse = isJSONResponse;