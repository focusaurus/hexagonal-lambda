"use strict";
const request = require("request");
const tap = require("tap");

const url = process.env.API_URL;

tap.test("get-hex base case", test => {
  request(
    {
      url: `${url}/up`,
      method: "POST",
      body: {cat: "cat", dog: "dog"},
      json: true
    },
    (error, res, body) => {
      tap.error(error);
      tap.match(res.statusCode, 200);
      tap.same(body, {CAT: "cat", DOG: "dog"});
      test.end();
    }
  );
});

tap.test("get-hex input validation", test => {
  request(
    {
      url: `${url}/up`,
      method: "POST",
      body: "{]"
    },
    (error, res, body) => {
      tap.error(error);
      tap.match(res.statusCode, 400);
      tap.match(body, "Invalid");
      test.end();
    }
  );
});
