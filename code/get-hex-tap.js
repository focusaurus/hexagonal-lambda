"use strict";
const {handler, eventSchema} = require("./get-hex-lambda");
const dot2val = require("dot2val");
const httpbin = require("./core/httpbin");
const sinon = require("sinon");
const tap = require("tap");

let sandbox;
let stubs;

function mockEvent(path, value) {
  const event = eventSchema.example();
  if (path) {
    dot2val.set(event, path, value);
  }
  return event;
}

tap.beforeEach(done => {
  sandbox = sinon.sandbox.create();

  stubs = {
    getBytes: sandbox.stub(httpbin, "getBytes"),
    clock: sinon.useFakeTimers()
  };
  done();
});

tap.afterEach(done => {
  sandbox.restore();
  stubs.clock.restore();
  done();
});

const invalids = [
  ["pathParameters.size", false],
  ["pathParameters.size", "11111"], // too many digits
  ["pathParameters.size", "!!!#^$*&*"]
];

invalids.forEach(pair => {
  tap.test(`handler validates ${pair[0]}`, test => {
    const event = mockEvent(pair[0], pair[1]);
    handler(event, {}, (error, res) => {
      tap.error(error);
      tap.same(res.statusCode, 400, "should send 400 status");
      test.end();
    });
  });
});

tap.test("handler should work in base case", test => {
  const event = mockEvent();
  stubs.getBytes.yields(null, Buffer.from("wxyz"));
  handler(event, {}, (error, res) => {
    tap.error(error);
    tap.same(res.statusCode, 200);
    tap.ok(stubs.getBytes.calledWith(event.pathParameters.size));
    const body = JSON.parse(res.body);
    tap.same(body, {hex: "7778797a"});
    test.end();
  });
});

tap.test("should handle errback on getBytes", test => {
  const event = mockEvent();
  stubs.getBytes.yields(new Error("unit-test-error"));
  handler(event, {}, (error, res) => {
    tap.error(error);
    tap.same(res.statusCode, 500);
    tap.match(res.body, "unit-test-error");
    tap.ok(stubs.getBytes.calledOnce);
    test.end();
  });
});
