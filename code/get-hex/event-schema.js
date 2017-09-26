"use strict";
const schemas = require("../schemas");

module.exports = schemas.define({
  type: "object",
  required: ["queryStringParameters"],
  properties: {
    queryStringParameters: {
      type: "object",
      required: ["size"],
      properties: {
        size: {
          type: "string",
          pattern: /^\d{1,4}$/.source
        }
      }
    }
  },
  example() {
    return {queryStringParameters: {size: "32"}};
  }
});
