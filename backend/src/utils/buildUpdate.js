const HttpError = require('./HttpError');

/**
 * Return a plain object containing only the whitelisted keys from `body`.
 * Throws HttpError(400) if no whitelisted fields are present.
 */
module.exports = (body, allowedFields) => {
  const update = {};
  for (const key of Object.keys(body)) {
    if (allowedFields.has(key)) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    throw new HttpError(400, 'No updatable fields provided');
  }
  return update;
};
