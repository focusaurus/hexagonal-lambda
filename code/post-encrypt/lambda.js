"use strict";
const cipher = require("./cipher");
const config = require("../config");
const lambdaUtils = require("../lambda-utils");

const console = lambdaUtils.console;

function postEncrypt(call, res, next) {
  console.log("Encrypting payload");
  const encrypted = cipher.encrypt(JSON.stringify(call.event.body));
  call.body = {encrypted};
  next();
}

/* eslint-disable global-require */
const handler = require("mintsauce")();

handler.use([
  lambdaUtils.logStart,
  lambdaUtils.validateConfig(config),
  lambdaUtils.validateEvent(require("./event-schema")),
  postEncrypt,
  lambdaUtils.sendBody,
  lambdaUtils.errorHandler
]);

exports.handler = handler;
