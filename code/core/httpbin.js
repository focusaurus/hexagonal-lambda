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

function post(payload, callback) {
  request(
    {
      url: `${config.HTTPBIN_URL}/post`,
      method: "POST",
      json: true,
      body: payload
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
      let data;
      try {
        data = JSON.parse(body.data);
      } catch (error2) {
        callback(new Error(`Invalid JSON from httpbin. ${error2.message}`));
        return;
      }
      callback(null, data);
    }
  );
}
exports.post = post;
