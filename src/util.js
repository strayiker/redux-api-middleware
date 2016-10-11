import { isJSONResponse } from './validation';
import { InternalError, ApiError } from './errors';

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
    return Promise.resolve(response);
  } else {
    return Promise.reject(response);
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
  if (!isJSONResponse(response)) {
    return Promise.resolve(response);
  }

  return response.json().then((json) => {
    response.jsonData = json;
    return Promise.resolve(response);
  });
}

/**
 * Blow up string or symbol types into full-fledged type descriptors,
 *   and add defaults
 *
 * @function normalizeTypeDescriptors
 * @access private
 * @param {Array} types - The [RSAA].types from a validated RSAA
 * @returns {Array}
 */
function normalizeTypeDescriptors(types) {
  let [requestType, successType, failureType] = types;

  if (typeof requestType === 'string' || typeof requestType === 'symbol') {
    requestType = { type: requestType };
  }

  if (typeof successType === 'string' || typeof successType === 'symbol') {
    successType = { type: successType };
  }

  if (typeof failureType === 'string' || typeof failureType === 'symbol') {
    failureType = { type: failureType };
  }

  successType = {
    payload: (action, state, response) => response.jsonData,
    ...successType
  };
  
  failureType = {
    payload: (action, state, response) => new ApiError(response.status, response.statusText, response.jsonData),
    ...failureType
  };

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
function actionWith(descriptor, { action, state, response } = {}) {
  try {
    descriptor.payload = (
      typeof descriptor.payload === 'function'
        ? descriptor.payload(action, state, response)
        : descriptor.payload
    );
  } catch (e) {
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }

  try {
    descriptor.meta = (
      typeof descriptor.meta === 'function'
        ? descriptor.meta(action, state, response)
        : descriptor.meta
    );
  } catch (e) {
    delete descriptor.meta;
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }

  return descriptor;
}

export { status, json, normalizeTypeDescriptors, actionWith };
