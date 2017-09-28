"use strict";
const request = require("request");
const tap = require("tap");

const url = `${process.env.API_URL}/up`;

tap.test("post-up base case", test => {
  request(
    {
      url,
      method: "POST",
      body: {cat: "cat", dog: "dog"},
      json: true
    },
    (error, res, body) => {
      test.error(error);
      test.match(res.statusCode, 200);
      test.same(body, {CAT: "cat", DOG: "dog"});
      test.end();
    }
  );
});

tap.test("post-up input validation", test => {
  request(
    {
      url,
      method: "POST",
      body: "{]"
    },
    (error, res, body) => {
      test.error(error);
      test.match(res.statusCode, 400);
      test.match(body, "Invalid");
      test.end();
    }
  );
});

tap.test("post-up CORS preflight should have right headers", test => {
  request(
    {
      url,
      method: "OPTIONS"
    },
    (error, res) => {
      test.error(error);
      test.match(res.statusCode, 200);
      test.same(res.headers["access-control-allow-origin"], "*");
      test.match(res.headers["access-control-allow-methods"], "POST");
      test.end();
    }
  );
});
