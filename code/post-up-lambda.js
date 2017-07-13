"use strict";
const config = require("./core/config");
const httpbin = require("./core/httpbin");
const lambdaUtils = require("./core/lambda-utils");
const schemas = require("./core/schemas");
const uppercaseKeys = require("uppercase-keys");

const console = lambdaUtils.console;

exports.eventSchema = schemas.define({
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object"
    }
  },
  example() {
    return {body: JSON.stringify({foo: "FOO", bar: "BAR"})};
  }
});

function postUp(call, res, next) {
  console.log(`Posting up to httpbin`);
  httpbin.post(call.event.body, (error, body) => {
    if (error) {
      next(error);
      return;
    }
    // eslint-disable-next-line no-param-reassign
    call.body = uppercaseKeys(body);
    next();
  });
}

/* eslint-disable global-require */
const lambda = require("mintsauce")();

lambda.use([
  lambdaUtils.logStart,
  lambdaUtils.validateConfig(config),
  lambdaUtils.validateEvent(exports.eventSchema),
  postUp,
  lambdaUtils.sendBody,
  lambdaUtils.errorHandler
]);

exports.handler = lambda;

/* istanbul ignore if */
if (require.main === module) {
  exports.handler(exports.eventSchema.example(), {}, console.log);
}
