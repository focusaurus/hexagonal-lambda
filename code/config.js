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
    HL_HTTPBIN_URL: "https://httpbin.example.com",
    HL_SECRET1: "unit-test-hl-secret-1"
  });
}

const jsonSchema = {
  type: "object",
  required: ["HL_HTTPBIN_URL", "HL_SECRET1"],
  properties: {
    HL_HTTPBIN_URL: schemas.uri,
    HL_SECRET1: schemas.secret
  }
};

module.exports = validateEnvSchema(jsonSchema, process.env);
