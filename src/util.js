import isEmpty from 'lodash.isempty';
import { InternalError, ApiError, RequestError } from './errors';


function getJson(response) {
  if (!isEmpty(response.body)) {
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
    payload: (action, state, response) => getJson(response),
    ...successType
  };

  failureType = {
    payload: (action, state, response, error) => {
      if (response) {
        return new ApiError(response.status, response.statusText, getJson(response))
      }
      return new RequestError(error.toString());
    },
    ...failureType
  };

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
 * @param {object} error - Error object
 * @returns {object}
 */
function actionWith(descriptor, { action, state, response, error } = {}) {
  try {
    descriptor.payload = (
      typeof descriptor.payload === 'function'
        ? descriptor.payload(action, state, response, error)
        : descriptor.payload
    );
  } catch (e) {
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }

  try {
    descriptor.meta = (
      typeof descriptor.meta === 'function'
        ? descriptor.meta(action, state, response, error)
        : descriptor.meta
    );
  } catch (e) {
    delete descriptor.meta;
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }

  return descriptor;
}

export { normalizeTypeDescriptors, actionWith };
