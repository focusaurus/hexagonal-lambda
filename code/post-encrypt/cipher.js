"use strict";
const config = require("../config");
const crypto = require("crypto");

function encrypt(clear) {
  const cipher = crypto.createCipher("aes192", config.HL_SECRET1);
  return cipher.update(clear, "utf8", "base64") + cipher.final("base64");
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipher("aes192", config.HL_SECRET1);
  return decipher.update(encrypted, "base64", "utf8") + decipher.final("utf8");
}

module.exports = {encrypt, decrypt};
