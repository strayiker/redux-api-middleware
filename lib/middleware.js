'use strict';

var _extends = require('babel-runtime/helpers/extends')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _RSAA = require('./RSAA');

var _RSAA2 = _interopRequireDefault(_RSAA);

var _validation = require('./validation');

var _errors = require('./errors');

var _util = require('./util');

var requestId = 0;

/**
 * A Redux middleware that processes RSAA actions.
 *
 * @type {ReduxMiddleware}
 * @access public
 */
function apiMiddleware(_ref) {
  var _this = this;

  var getState = _ref.getState;

  return function (next) {
    return function callee$2$0(action) {
      var validationErrors, _callAPI, _requestType, callAPI, method, body, credentials, bailout, types, _callAPI$onRequest, onRequest, _callAPI$onSuccess, onSuccess, _callAPI$onFailure, onFailure, endpoint, headers, _normalizeTypeDescriptors, requestType, successType, failureType, request, promise, res;

      return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            if (_validation.isRSAA(action)) {
              context$3$0.next = 2;
              break;
            }

            return context$3$0.abrupt('return', next(action));

          case 2:
            validationErrors = _validation.validateRSAA(action);

            if (!validationErrors.length) {
              context$3$0.next = 7;
              break;
            }

            _callAPI = action[_RSAA2['default']];

            if (_callAPI.types && Array.isArray(_callAPI.types)) {
              _requestType = _callAPI.types[0];

              if (_requestType && _requestType.type) {
                _requestType = _requestType.type;
              }

              next({
                type: _requestType,
                payload: new _errors.InvalidRSAA(validationErrors),
                error: true
              });

              if (_callAPI.onRequest && typeof _callAPI.onRequest === 'function') {
                _callAPI.onRequest();
              }
            }

            return context$3$0.abrupt('return');

          case 7:
            callAPI = action[_RSAA2['default']];
            method = callAPI.method;
            body = callAPI.body;
            credentials = callAPI.credentials;
            bailout = callAPI.bailout;
            types = callAPI.types;
            _callAPI$onRequest = callAPI.onRequest;
            onRequest = _callAPI$onRequest === undefined ? function () {} : _callAPI$onRequest;
            _callAPI$onSuccess = callAPI.onSuccess;
            onSuccess = _callAPI$onSuccess === undefined ? function () {} : _callAPI$onSuccess;
            _callAPI$onFailure = callAPI.onFailure;
            onFailure = _callAPI$onFailure === undefined ? function () {} : _callAPI$onFailure;
            endpoint = callAPI.endpoint;
            headers = callAPI.headers;
            _normalizeTypeDescriptors = _util.normalizeTypeDescriptors(types);
            requestType = _normalizeTypeDescriptors[0];
            successType = _normalizeTypeDescriptors[1];
            failureType = _normalizeTypeDescriptors[2];
            context$3$0.prev = 25;

            if (!(typeof bailout === 'boolean' && bailout || typeof bailout === 'function' && bailout(getState()))) {
              context$3$0.next = 28;
              break;
            }

            return context$3$0.abrupt('return');

          case 28:
            context$3$0.next = 37;
            break;

          case 30:
            context$3$0.prev = 30;
            context$3$0.t0 = context$3$0['catch'](25);
            context$3$0.next = 34;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, requestType, {
              payload: new _errors.RequestError('[RSAA].bailout function failed'),
              error: true
            }), [action, getState()]));

          case 34:
            context$3$0.t1 = context$3$0.sent;
            next(context$3$0.t1);
            return context$3$0.abrupt('return', onRequest());

          case 37:
            if (!(typeof endpoint === 'function')) {
              context$3$0.next = 49;
              break;
            }

            context$3$0.prev = 38;

            endpoint = endpoint(getState());
            context$3$0.next = 49;
            break;

          case 42:
            context$3$0.prev = 42;
            context$3$0.t2 = context$3$0['catch'](38);
            context$3$0.next = 46;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, requestType, {
              payload: new _errors.RequestError('[RSAA].endpoint function failed'),
              error: true
            }), [action, getState()]));

          case 46:
            context$3$0.t3 = context$3$0.sent;
            next(context$3$0.t3);
            return context$3$0.abrupt('return', onRequest());

          case 49:
            if (!(typeof headers === 'function')) {
              context$3$0.next = 61;
              break;
            }

            context$3$0.prev = 50;

            headers = headers(getState());
            context$3$0.next = 61;
            break;

          case 54:
            context$3$0.prev = 54;
            context$3$0.t4 = context$3$0['catch'](50);
            context$3$0.next = 58;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, requestType, {
              payload: new _errors.RequestError('[RSAA].headers function failed'),
              error: true
            }), [action, getState()]));

          case 58:
            context$3$0.t5 = context$3$0.sent;
            next(context$3$0.t5);
            return context$3$0.abrupt('return', onRequest());

          case 61:
            request = { id: requestId++ };
            promise = undefined;
            res = undefined;
            context$3$0.prev = 64;

            // Make the API call
            promise = fetch(endpoint, { method: method, body: body, credentials: credentials, headers: headers });
            request.promise = promise;

            // We can now dispatch the request FSA
            context$3$0.next = 69;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, requestType, {
              request: promise
            }), [action, getState()]));

          case 69:
            context$3$0.t6 = context$3$0.sent;
            next(context$3$0.t6);

            onRequest(request);

            context$3$0.next = 74;
            return _regeneratorRuntime.awrap(promise);

          case 74:
            res = context$3$0.sent;
            context$3$0.next = 86;
            break;

          case 77:
            context$3$0.prev = 77;
            context$3$0.t7 = context$3$0['catch'](64);
            context$3$0.next = 81;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, failureType, {
              payload: new _errors.RequestError(context$3$0.t7.message),
              error: true
            }), [action, getState()]));

          case 81:
            context$3$0.t8 = context$3$0.sent;
            next(context$3$0.t8);

            if (!promise) {
              context$3$0.next = 85;
              break;
            }

            return context$3$0.abrupt('return', onFailure(request));

          case 85:
            return context$3$0.abrupt('return', onFailure());

          case 86:
            if (!res.ok) {
              context$3$0.next = 94;
              break;
            }

            context$3$0.next = 89;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, successType, {
              request: promise
            }), [action, getState(), res]));

          case 89:
            context$3$0.t9 = context$3$0.sent;
            next(context$3$0.t9);

            onSuccess(request);
            context$3$0.next = 99;
            break;

          case 94:
            context$3$0.next = 96;
            return _regeneratorRuntime.awrap(_util.actionWith(_extends({}, failureType, {
              request: promise,
              error: true
            }), [action, getState(), res]));

          case 96:
            context$3$0.t10 = context$3$0.sent;
            next(context$3$0.t10);

            onFailure(request);

          case 99:
          case 'end':
            return context$3$0.stop();
        }
      }, null, _this, [[25, 30], [38, 42], [50, 54], [64, 77]]);
    };
  };
}

exports.apiMiddleware = apiMiddleware;

// Do not process actions without an [RSAA] property

// Try to dispatch an error request FSA for invalid RSAAs

// Parse the validated RSAA action

// Should we bail out?

// Process [RSAA].endpoint function

// Process [RSAA].headers function

// The request was malformed, or there was a network error

// Process the server response