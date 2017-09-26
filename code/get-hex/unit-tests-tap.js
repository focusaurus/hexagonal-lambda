"use strict";
const {handler} = require("./lambda");
const eventSchema = require("./event-schema");
const httpbin = require("../core/httpbin");
const set = require("lodash.set");
const sinon = require("sinon");
const tap = require("tap");

let sandbox;
let stubs;

function mockEvent(path, value) {
  const event = eventSchema.example();
  if (path) {
    set(event, path, value);
  }
  return event;
}

tap.beforeEach(done => {
  sandbox = sinon.sandbox.create();

  stubs = {
    getBytes: sandbox.stub(httpbin, "getBytes")
  };
  done();
});

tap.afterEach(done => {
  sandbox.restore();
  done();
});

const invalids = [
  ["queryStringParameters.size", false],
  ["queryStringParameters.size", "11111"], // too many digits
  ["queryStringParameters.size", "!!!#^$*&*"]
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
  stubs.getBytes.yields(null, Buffer.from("wxyz"));
  handler(event, {}, (error, res) => {
    test.error(error);
    test.same(res.statusCode, 200);
    test.ok(stubs.getBytes.calledWith(event.queryStringParameters.size));
    const body = JSON.parse(res.body);
    test.same(body, {hex: "7778797a"});
    test.end();
  });
});

tap.test("should handle errback on getBytes", test => {
  const event = mockEvent();
  stubs.getBytes.yields(new Error("unit-test-error"));
  handler(event, {}, (error, res) => {
    test.error(error);
    test.same(res.statusCode, 500);
    test.match(res.body, "unit-test-error");
    test.ok(stubs.getBytes.calledOnce);
    test.end();
  });
});
