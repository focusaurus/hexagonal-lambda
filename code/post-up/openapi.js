"use strict";

const bodySchema = require("./body-schema");

module.exports = {
  paths: {
    "/up": {
      post: {
        summary: "Transform a JSON object's keys to uppercase",
        description:
          "Input an object with arbitrary property names, get back a corresponding object with all uppercase property names",
        parameters: [
          {
            description: "Arbitrary JSON object payload",
            in: "body",
            name: "body",
            required: true,
            schema: {type: "object"}
          }
        ],
        responses: {
          "200": {
            description: "JSON object with uppercase property names",
            schema: bodySchema.openAPI()
          }
        }
      }
    }
  }
};
