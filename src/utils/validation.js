const Ajv = require("ajv");

/**
 * Validates data against a JSON schema
 * @param {Object} data - The data to validate
 * @param {Object} schema - The JSON schema to validate against
 * @returns {boolean} - Whether the data is valid according to the schema
 */
function validateSchema(data, schema) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  return validate(data);
}

module.exports = {
  validateSchema
};
