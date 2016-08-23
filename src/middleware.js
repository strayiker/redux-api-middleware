import RSAA from './RSAA';
import { isRSAA, validateRSAA } from './validation';
import { InvalidRSAA, RequestError } from './errors' ;
import { normalizeTypeDescriptors, actionWith } from './util';


let requestId = 0;

/**
 * A Redux middleware that processes RSAA actions.
 *
 * @type {ReduxMiddleware}
 * @access public
 */
function apiMiddleware({ getState }) {
  return (next) => async(action) => {
    // Do not process actions without an [RSAA] property
    if (!isRSAA(action)) {
      return next(action);
    }

    // Try to dispatch an error request FSA for invalid RSAAs
    const validationErrors = validateRSAA(action);

    if (validationErrors.length) {
      const callAPI = action[RSAA];

      if (callAPI.types && Array.isArray(callAPI.types)) {
        let requestType = callAPI.types[0];

        if (requestType && requestType.type) {
          requestType = requestType.type;
        }

        next({
          type: requestType,
          payload: new InvalidRSAA(validationErrors),
          error: true
        });

        if (callAPI.onRequest &&
          typeof callAPI.onRequest === 'function') {
          callAPI.onRequest();
        }
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
      onRequest = () => {},
      onSuccess = () => {},
      onFailure = () => {}
    } = callAPI;

    let {
      endpoint,
      headers
    } = callAPI;

    const [
      requestType,
      successType,
      failureType
    ] = normalizeTypeDescriptors(types);

    // Should we bail out?
    try {
      if ((typeof bailout === 'boolean' && bailout) ||
        (typeof bailout === 'function' && bailout(getState()))) {
        return;
      }
    } catch (e) {
      next(await actionWith({
        ...requestType,
        payload: new RequestError('[RSAA].bailout function failed'),
        error: true
      }, [action, getState()]));
      return onRequest();
    }

    // Process [RSAA].endpoint function
    if (typeof endpoint === 'function') {
      try {
        endpoint = endpoint(getState());
      } catch (e) {
        next(await actionWith({
          ...requestType,
          payload: new RequestError('[RSAA].endpoint function failed'),
          error: true
        }, [action, getState()]));
        return onRequest();
      }
    }

    // Process [RSAA].headers function
    if (typeof headers === 'function') {
      try {
        headers = headers(getState());
      } catch (e) {
        next(await actionWith({
          ...requestType,
          payload: new RequestError('[RSAA].headers function failed'),
          error: true
        }, [action, getState()]));
        return onRequest();
      }
    }

    const request = { id: requestId++ };
    let promise;
    let res;

    try {
      // Make the API call
      promise = fetch(endpoint, { method, body, credentials, headers });
      request.promise = promise;

      // We can now dispatch the request FSA
      next(await actionWith({
        ...requestType,
        request: promise
      }, [action, getState()]));
      onRequest(request);

      res = await promise;
    } catch (e) {
      // The request was malformed, or there was a network error
      next(await actionWith({
        ...failureType,
        payload: new RequestError(e.message),
        error: true
      }, [action, getState()]));

      if (promise) {
        return onFailure(request);
      }
      return onFailure();
    }

    // Process the server response
    if (res.ok) {
      next(await actionWith({
        ...successType,
        request: promise
      }, [action, getState(), res]));
      onSuccess(request);
    } else {
      next(await actionWith({
        ...failureType,
        request: promise,
        error: true
      }, [action, getState(), res]));
      onFailure(request);
    }
  }
}

export { apiMiddleware };
