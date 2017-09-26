"use strict";
const config = require("../config");
const httpbin = require("../httpbin");
const lambdaUtils = require("../lambda-utils");
const uppercaseKeys = require("uppercase-keys");

const console = lambdaUtils.console;

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
  lambdaUtils.validateEvent(require("./event-schema")),
  postUp,
  lambdaUtils.sendBody,
  lambdaUtils.errorHandler
]);

exports.handler = lambda;

/* istanbul ignore if */
if (require.main === module) {
  exports.handler(exports.eventSchema.example(), {}, console.log);
}
