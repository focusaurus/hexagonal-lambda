#!/usr/bin/env node
"use strict";
const glob = require("glob");
const merge = require("lodash.merge");
const output = require("../code/terraform-output");
const url = require("url");
const path = require("path");

process.chdir(path.join(__dirname, ".."));
const deploy = process.argv[2] || "dev";
const apiUrl = url.parse(output("api_url", deploy));
const endpoints = glob.sync("./code/*/openapi.js");
const openApi = merge(
  {
    swagger: "2.0",
    info: {
      title: `Hexagola Lambda ${deploy}`,
      description: "Sample AWS Lambda API",
      version: "1.0.0"
    },
    host: apiUrl.host,
    schemes: ["https"],
    basePath: apiUrl.path,
    produces: ["application/json"],
    consumes: ["application/json"],
    definitions: {
      error: {
        type: "object",
        properties: {
          message: {
            type: "string"
          }
        },
        example: {
          message: "Error calling httpbin: NameNotFound"
        }
      }
    }
  },
  // Merge in all modules matching glob ./*/openapi.js
  ...endpoints
    .map(apiPath => apiPath.replace("./code/", "../code/"))
    .map(require)
);

const standardResponses = {
  "500": {
    description: "internal server error",
    schema: {
      $ref: "#/definitions/error"
    }
  }
};

// Add standard responses to every endpoint
Object.keys(openApi.paths).forEach(apiPath => {
  const endpoint = openApi.paths[apiPath];
  if (endpoint.get) {
    merge(endpoint.get.responses, standardResponses);
  }
  if (endpoint.post) {
    merge(endpoint.post.responses, standardResponses);
  }
});

console.log(JSON.stringify(openApi, null, 2));
