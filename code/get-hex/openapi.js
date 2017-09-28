"use strict";

const eventSchema = require("./event-schema");
const bodySchema = require("./body-schema");

module.exports = {
  paths: {
    "/bytes": {
      get: {
        summary: "Get a number of random bytes encoded as hexadecimal",
        description: "",
        parameters: [
          Object.assign(
            {},
            {
              name: "size",
              description: "Number of bytes to produce",
              in: "query",
              required: true
            },
            eventSchema.properties.queryStringParameters.properties.size
          )
        ],
        responses: {
          "200": {
            description: "JSON object with hex property",
            schema: bodySchema.openapi()
          }
        }
      }
    }
  }
};
