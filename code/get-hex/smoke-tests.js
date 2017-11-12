"use strict";
const request = require("request");
const tap = require("tap");

const url = process.env.HL_API_URL;

tap.test("get-hex base case", test => {
  request(
    {url: `${url}/bytes`, qs: {size: 4}, json: true},
    (error, res, body) => {
      test.error(error);
      test.match(res.statusCode, 200);
      test.match(body.hex.length, 8);
      test.end();
    }
  );
});

tap.test("get-hex input validation", test => {
  request(
    {url: `${url}/bytes`, qs: {size: false}, json: true},
    (error, res, body) => {
      test.error(error);
      test.match(res.statusCode, 400);
      test.match(body.message, "Invalid");
      test.end();
    }
  );
});
