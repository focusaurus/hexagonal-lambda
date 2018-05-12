"use strict";
const {handler} = require("./lambda");
const eventSchema = require("./event-schema");
const httpbin = require("../httpbin");
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
  sandbox = sinon.createSandbox();

  stubs = {
    post: sandbox.stub(httpbin, "post")
  };
  done();
});

tap.afterEach(done => {
  sandbox.restore();
  done();
});

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
  stubs.post.yields(null, {up: "UP"});
  handler(event, {}, (error, res) => {
    test.error(error);
    test.same(res.statusCode, 200);
    const body = JSON.parse(res.body);
    test.same(body, {UP: "UP"});
    test.end();
  });
});

tap.test("should handle errback on post", test => {
  const event = mockEvent();
  stubs.post.yields(new Error("unit-test-error"));
  handler(event, {}, (error, res) => {
    test.error(error);
    test.same(res.statusCode, 500);
    test.match(res.body, "unit-test-error");
    test.ok(stubs.post.calledOnce);
    test.end();
  });
});
