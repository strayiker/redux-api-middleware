'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _RSAA = require('./RSAA');

var _RSAA2 = _interopRequireDefault(_RSAA);

var _validation = require('./validation');

var _errors = require('./errors');

var _util = require('./util');

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _superagentRequestid = require('superagent-requestid');

var _superagentRequestid2 = _interopRequireDefault(_superagentRequestid);

/**
 * A Redux middleware that processes RSAA actions.
 *
 * @type {ReduxMiddleware}
 * @access public
 */
function apiMiddleware(_ref) {
  var getState = _ref.getState;

  return function (next) {
    return function (action) {
      // Do not process actions without an [RSAA] property
      if (!_validation.isRSAA(action)) {
        return next(action);
      }

      // Try to dispatch an error request FSA for invalid RSAAs
      var validationErrors = _validation.validateRSAA(action);

      if (validationErrors.length) {
        var _callAPI = action[_RSAA2['default']];

        if (_callAPI.types && Array.isArray(_callAPI.types)) {
          var _requestType = _callAPI.types[0];

          if (_requestType && _requestType.type) {
            _requestType = _requestType.type;
          }

          return next({
            type: _requestType,
            payload: new _errors.InvalidRSAA(validationErrors),
            error: true
          });
        }

        return;
      }

      // Parse the validated RSAA action
      var callAPI = action[_RSAA2['default']];

      var method = callAPI.method;
      var query = callAPI.query;
      var body = callAPI.body;
      var credentials = callAPI.credentials;
      var bailout = callAPI.bailout;
      var types = callAPI.types;
      var meta = callAPI.meta;
      var endpoint = callAPI.endpoint;
      var headers = callAPI.headers;

      var _normalizeTypeDescriptors = _util.normalizeTypeDescriptors(types, meta);

      var requestType = _normalizeTypeDescriptors[0];
      var successType = _normalizeTypeDescriptors[1];
      var failureType = _normalizeTypeDescriptors[2];
      var abortType = _normalizeTypeDescriptors[3];

      // Should we bail out?
      try {
        var bailoutResult = typeof bailout === 'function' ? bailout(getState()) : bailout;
        if (bailoutResult) {
          return;
        }
      } catch (e) {
        return next(_util.actionWith(_extends({}, requestType, {
          payload: new _errors.RequestError('[RSAA].bailout function failed'),
          error: true
        }), {
          action: action,
          state: getState()
        }));
      }

      // Process [RSAA].endpoint function
      if (typeof endpoint === 'function') {
        try {
          endpoint = endpoint(getState());
        } catch (e) {
          return next(_util.actionWith(_extends({}, requestType, {
            payload: new _errors.RequestError('[RSAA].endpoint function failed'),
            error: true
          }), {
            action: action,
            state: getState()
          }));
        }
      }

      // Process [RSAA].headers function
      if (typeof headers === 'function') {
        try {
          headers = headers(getState());
        } catch (e) {
          return next(_util.actionWith(_extends({}, requestType, {
            payload: new _errors.RequestError('[RSAA].headers function failed'),
            error: true
          }), {
            action: action,
            state: getState()
          }));
        }
      }

      var request = undefined;

      try {
        // Make the API call
        request = _superagent2['default'](method, endpoint).use(_superagentRequestid2['default']);

        if (query) {
          request.query(query);
        }

        if (headers) {
          request.set(headers);
        }

        if (body) {
          request.send(body);
        }

        if (credentials) {
          request.withCredentials();
        }

        // We can now dispatch the request FSA
        next(_util.actionWith(_extends({}, requestType, {
          request: request
        }), {
          action: action,
          state: getState()
        }));
      } catch (e) {
        // The request was malformed, or there was a network error
        return next(_util.actionWith(_extends({}, requestType, {
          payload: new _errors.RequestError(e.message),
          error: true
        }), {
          action: action,
          state: getState()
        }));
      }

      request.on('abort', function () {
        next(_util.actionWith(_extends({}, abortType, {
          request: request
        }), {
          action: action,
          state: getState()
        }));
      });

      // Process the server response
      return request.then(function (response) {
        return _Promise.resolve(next(_util.actionWith(_extends({}, successType, {
          request: request
        }), {
          action: action,
          state: getState(),
          response: response
        })));
      })['catch'](function (error) {
        return _Promise.reject(next(_util.actionWith(_extends({}, failureType, {
          request: request,
          error: true
        }), {
          action: action,
          state: getState(),
          response: error.response,
          error: error
        })));
      });
    };
  };
}

exports.apiMiddleware = apiMiddleware;