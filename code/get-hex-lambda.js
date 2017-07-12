"use strict";
const config = require("./core/config");
const httpbin = require("./core/httpbin");
const lambdaUtils = require("./core/lambda-utils");
const schemas = require("./core/schemas");

const console = lambdaUtils.console;

exports.eventSchema = schemas.define({
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

function getHex(call, res, next) {
  const size = call.event.queryStringParameters.size;
  console.log(`Requesting ${size} bytes from httpbin`);
  httpbin.getBytes(size, (error, buffer) => {
    if (error) {
      next(error);
      return;
    }
    // eslint-disable-next-line no-param-reassign
    call.body = {hex: buffer.toString("hex")};
    next();
  });
}

/* eslint-disable global-require */
const lambda = require("mintsauce")();

lambda.use([
  lambdaUtils.logStart,
  lambdaUtils.validateConfig(config),
  lambdaUtils.validateEvent(exports.eventSchema),
  getHex,
  lambdaUtils.sendBody,
  lambdaUtils.errorHandler
]);

exports.handler = lambda;

/* istanbul ignore if */
if (require.main === module) {
  exports.handler(exports.eventSchema.example(), {}, console.log);
}
