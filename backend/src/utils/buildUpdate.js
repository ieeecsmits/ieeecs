const HttpError = require('./HttpError');

/**
 * Build a parameterized SQL UPDATE SET clause from req.body, allowing only
 * whitelisted columns. Returns { setClause, values } where values[0] is the id
 * placeholder ($1) and subsequent placeholders are the updated fields.
 */
module.exports = (body, allowedColumns, id) => {
  const entries = Object.entries(body).filter(([k]) => allowedColumns.has(k));
  if (entries.length === 0) {
    throw new HttpError(400, 'No updatable fields provided');
  }
  const setClause = entries.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const values = [id, ...entries.map(([, v]) => v)];
  return { setClause, values };
};
