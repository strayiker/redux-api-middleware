import { isJSONResponse } from './validation';
import { InternalError, ApiError } from './errors';


/**
 * Extract JSON body from a server response
 *
 * @function getJSON
 * @access public
 * @param {object} res - A raw response object
 * @returns {Promise}
 */
async function getJSON(res) {
  if (isJSONResponse(res)) {
    return await res.json();
  }
  return await Promise.resolve();
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

  successType = {
    payload: (action, state, res) => getJSON(res),
    ...successType
  };

  if (typeof failureType === 'string' || typeof failureType === 'symbol') {
    failureType = { type: failureType };
  }

  failureType = {
    payload: (action, state, res) => getJSON(res).then((json) =>
      new ApiError(res.status, res.statusText, json)
    ),
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
 * @param {Array} args - The array of arguments for `payload` and `meta` function properties
 * @returns {object}
 */
async function actionWith(descriptor, args) {
  try {
    descriptor.payload = await (
      typeof descriptor.payload === 'function'
        ? descriptor.payload(...args)
        : descriptor.payload
    );
  } catch (e) {
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }

  try {
    descriptor.meta = await (
      typeof descriptor.meta === 'function'
        ? descriptor.meta(...args)
        : descriptor.meta
    );
  } catch (e) {
    delete descriptor.meta;
    descriptor.payload = new InternalError(e.message);
    descriptor.error = true;
  }

  return descriptor;
}

export { getJSON, normalizeTypeDescriptors, actionWith };
