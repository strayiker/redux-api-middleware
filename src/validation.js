import RSAA from './RSAA';
import isPlainObject from 'lodash.isplainobject';


/**
 * Is the given action a plain JavaScript object with an [RSAA] property?
 *
 * @function isRSAA
 * @access public
 * @param {object} action - The action to check
 * @returns {boolean}
 */
function isRSAA(action) {
  return isPlainObject(action) && action.hasOwnProperty(RSAA);
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
  const validKeys = [
    'type',
    'payload',
    'request',
    'meta'
  ];

  if (!isPlainObject(obj)) {
    return false;
  }

  for (let key of Object.keys(obj)) {
    if (!~validKeys.indexOf(key)) {
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
  const validCallAPIKeys = [
    'endpoint',
    'method',
    'body',
    'headers',
    'credentials',
    'bailout',
    'types',
    'onRequest',
    'onSuccess',
    'onFailure'
  ];
  const validMethods = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ];
  const validCredentials = [
    'omit',
    'same-origin',
    'include'
  ];

  let validationErrors = [];

  if (!isRSAA(action)) {
    validationErrors.push('RSAAs must be plain JavaScript objects with an [RSAA] property');
    return validationErrors;
  }

  for (const key of Object.keys(action)) {
    if (key !== RSAA) {
      validationErrors.push(`Invalid root key: ${key}`);
    }
  }

  const callAPI = action[RSAA];

  if (!isPlainObject(callAPI)) {
    validationErrors.push('[RSAA] property must be a plain JavaScript object');
  }

  for (const key of Object.keys(callAPI)) {
    if (!~validCallAPIKeys.indexOf(key)) {
      validationErrors.push(`Invalid [RSAA] key: ${key}`);
    }
  }

  const {
    endpoint,
    method,
    headers,
    credentials,
    types,
    bailout,
    onRequest,
    onSuccess,
    onFailure
  } = callAPI;

  if (typeof endpoint === 'undefined') {
    validationErrors.push('[RSAA] must have an endpoint property');
  } else if (typeof endpoint !== 'string' && typeof endpoint !== 'function') {
    validationErrors.push('[RSAA].endpoint property must be a string or a function');
  }

  if (typeof method === 'undefined') {
    validationErrors.push('[RSAA] must have a method property');
  } else if (typeof method !== 'string') {
    validationErrors.push('[RSAA].method property must be a string');
  } else if (!~validMethods.indexOf(method.toUpperCase())) {
    validationErrors.push(`Invalid [RSAA].method: ${method.toUpperCase()}`);
  }

  if (typeof headers !== 'undefined' && !isPlainObject(headers) && typeof headers !== 'function') {
    validationErrors.push('[RSAA].headers property must be undefined, a plain JavaScript object, or a function');
  }

  if (typeof credentials !== 'undefined') {
    if (typeof credentials !== 'string') {
      validationErrors.push('[RSAA].credentials property must be undefined, or a string');
    } else if (!~validCredentials.indexOf(credentials)) {
      validationErrors.push(`Invalid [RSAA].credentials: ${credentials}`);
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
    const [requestType, successType, failureType] = types;

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
  const contentType = res.headers.get('Content-Type');
  const emptyCodes = [204, 205];

  return (!~emptyCodes.indexOf(res.status) && contentType && ~contentType.indexOf('json'));
}

export {
  isRSAA,
  isValidTypeDescriptor,
  validateRSAA,
  isValidRSAA,
  isJSONResponse
};
