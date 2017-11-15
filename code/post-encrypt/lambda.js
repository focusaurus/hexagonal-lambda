"use strict";
const config = require("../config");
const crypto = require("crypto");
const lambdaUtils = require("../lambda-utils");

const console = lambdaUtils.console;

function encrypt(clear) {
  const cipher = crypto.createCipher("aes192", config.HL_SECRET1);
  return cipher.update(clear, "utf8", "base64") + cipher.final("base64");
}

function postEncrypt(call, res, next) {
  console.log("Encrypting payload");
  const encrypted = encrypt(JSON.stringify(call.event.body));
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
