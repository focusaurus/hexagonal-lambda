"use strict";
const config = require("../config");
const crypto = require("crypto");
const lambdaUtils = require("../lambda-utils");

const console = lambdaUtils.console;

function postEncrypt(call, res, next) {
  console.log("Encrypting payload");
  const cipher = crypto.createCipher("aes192", process.env.HL_SECRET1);
  cipher.update(JSON.stringify(call.event.body));
  call.body = {encrypted: cipher.final("base64")};
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
