import RSAA from './RSAA';
import { isRSAA, validateRSAA } from './validation';
import { InvalidRSAA, RequestError } from './errors' ;
import { status, json, normalizeTypeDescriptors, actionWith } from './util';


let globalRequestId = 0;

/**
 * A Redux middleware that processes RSAA actions.
 *
 * @type {ReduxMiddleware}
 * @access public
 */
function apiMiddleware({ getState }) {
  return (next) => (action) => {
    // Do not process actions without an [RSAA] property
    if (!isRSAA(action)) {
      return next(action);
    }

    globalRequestId++;

    // Try to dispatch an error request FSA for invalid RSAAs
    const validationErrors = validateRSAA(action);

    if (validationErrors.length) {
      const callAPI = action[RSAA];

      if (callAPI.types && Array.isArray(callAPI.types)) {
        let requestType = callAPI.types[0];

        if (requestType && requestType.type) {
          requestType = requestType.type;
        }

        return next({
          type: requestType,
          payload: new InvalidRSAA(validationErrors),
          error: true
        });
      }

      return;
    }

    // Parse the validated RSAA action
    const callAPI = action[RSAA];

    const {
      method,
      body,
      credentials,
      bailout,
      types,
      meta
    } = callAPI;

    let {
      endpoint,
      headers
    } = callAPI;

    const [
      requestType,
      successType,
      failureType
    ] = normalizeTypeDescriptors(types, meta);

    // Should we bail out?
    try {
      const bailoutResult = typeof bailout === 'function' ? bailout(getState()) : bailout;
      if (bailoutResult) {
        return;
      }
    } catch (e) {
      return next(actionWith({
        ...requestType,
        payload: new RequestError('[RSAA].bailout function failed'),
        error: true
      }, {
        action,
        state: getState()
      }));
    }

    // Process [RSAA].endpoint function
    if (typeof endpoint === 'function') {
      try {
        endpoint = endpoint(getState());
      } catch (e) {
        return next(actionWith({
          ...requestType,
          payload: new RequestError('[RSAA].endpoint function failed'),
          error: true
        }, {
          action,
          state: getState()
        }));
      }
    }

    // Process [RSAA].headers function
    if (typeof headers === 'function') {
      try {
        headers = headers(getState());
      } catch (e) {
        return next(actionWith({
          ...requestType,
          payload: new RequestError('[RSAA].headers function failed'),
          error: true
        }, {
          action,
          state: getState()
        }));
      }
    }

    const request = { id: globalRequestId };
    let promise;

    try {
      // Make the API call
      promise = fetch(endpoint, { method, body, credentials, headers });
      request.cancelablePromise = promise;

      // We can now dispatch the request FSA
      next(actionWith({
        ...requestType,
        request
      }, {
        action,
        state: getState()
      }));
    } catch (e) {
      // The request was malformed, or there was a network error
      return next(actionWith({
        ...requestType,
        payload: new RequestError(e.message),
        error: true
      }, {
        action,
        state: getState()
      }));
    }

    // Process the server response
    return promise
      .then(json)
      .then(status)
      .then((response) => {
        next(actionWith({
          ...successType,
          request
        }, {
          action,
          state: getState(),
          response
        }));
      })
      .catch((response) => {
        next(actionWith({
          ...failureType,
          request,
          error: true
        }, {
          action,
          state: getState(),
          response
        }));
      });
  }
}

export { apiMiddleware };
