"use strict";
const schemas = require("./schemas");

function validateEnvSchema(jsonSchema, env) {
  const schema = schemas.define(jsonSchema);
  const envClone = Object.assign({}, env);
  const error = schema.check(envClone);
  if (error) {
    return {error: error.message};
  }
  return envClone;
}

if (process.env.NODE_ENV === "test") {
  // Force test values so tests are consistent even if environment
  // is set up for development
  Object.assign(process.env, {
    HTTPBIN_URL: "https://httpbin.example.com"
  });
}

const jsonSchema = {
  type: "object",
  required: ["HTTPBIN_URL"],
  properties: {
    HTTPBIN_URL: schemas.uri
  }
};

module.exports = validateEnvSchema(jsonSchema, process.env);
