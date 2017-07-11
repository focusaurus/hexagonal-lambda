"use strict";
const {httpError} = require("./lambda-utils");
const config = require("./config");
const request = require("request");

function getBytes(size, callback) {
  request(
    {
      url: `${config.HTTPBIN_URL}/bytes/${encodeURIComponent(size)}`,
      encoding: null
    },
    (error, res, body) => {
      if (error) {
        callback(error);
        return;
      }
      if (res.statusCode !== 200) {
        callback(
          httpError(
            res.statusCode,
            `httpbin response error status ${res.statusCode}`
          )
        );
        return;
      }
      callback(null, body);
    }
  );
}
exports.getBytes = getBytes;
