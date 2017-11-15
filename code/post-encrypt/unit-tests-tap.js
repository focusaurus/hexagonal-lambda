"use strict";
const {handler} = require("./lambda");
const config = require("../config");
const crypto = require("crypto");
const eventSchema = require("./event-schema");
const set = require("lodash.set");
const tap = require("tap");

function mockEvent(path, value) {
  const event = eventSchema.example();
  if (path) {
    set(event, path, value);
  }
  return event;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipher("aes192", config.HL_SECRET1);
  return decipher.update(encrypted, "base64", "utf8") + decipher.final("utf8");
}

const invalids = [
  ["body", 0], // not string
  ["body", false], // not string
  ["body", "11111"], // not JSON
  ["body", "{]"] // not JSON
];

invalids.forEach(pair => {
  tap.test(`handler validates ${pair[0]}`, test => {
    const event = mockEvent(pair[0], pair[1]);
    handler(event, {}, (error, res) => {
      test.error(error);
      test.same(res.statusCode, 400, "should send 400 status");
      test.end();
    });
  });
});

tap.test("handler should work in base case", test => {
  const event = mockEvent();
  handler(event, {}, (error, res) => {
    test.error(error);
    test.same(res.statusCode, 200);
    const body = JSON.parse(res.body);
    test.ok(body.encrypted);
    test.same(typeof body.encrypted, "string");
    const payloadJson = decrypt(body.encrypted);
    const payload = JSON.parse(payloadJson);
    test.match({foo: "FOO", bar: "BAR"}, payload);
    test.end();
  });
});
