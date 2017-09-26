"use strict";
const config = require("../config");
const httpbin = require("../httpbin");
const lambdaUtils = require("../lambda-utils");

const console = lambdaUtils.console;

function getHex(call, res, next) {
  const size = call.event.queryStringParameters.size;
  console.log(`Requesting ${size} bytes from httpbin`);
  httpbin.getBytes(size, (error, buffer) => {
    if (error) {
      next(error);
      return;
    }
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
