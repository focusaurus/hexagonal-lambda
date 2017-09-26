"use strict";
const config = require("../core/config");
const httpbin = require("../core/httpbin");
const lambdaUtils = require("../core/lambda-utils");

const console = lambdaUtils.console;

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
const handler = require("mintsauce")();

handler.use([
  lambdaUtils.logStart,
  lambdaUtils.validateConfig(config),
  lambdaUtils.validateEvent(require("./event-schema")),
  getHex,
  lambdaUtils.sendBody,
  lambdaUtils.errorHandler
]);

exports.handler = handler;
