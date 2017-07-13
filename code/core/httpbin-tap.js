"use strict";
const config = require("./config");
const httpbin = require("./httpbin");
const nock = require("nock");
const tap = require("tap");

function mockBytes() {
  return nock(config.HTTPBIN_URL).get(/^\/bytes/i);
}

function mockPost() {
  return nock(config.HTTPBIN_URL).post("/post");
}

tap.test("httpbin.getBytes base case", test => {
  const scope = mockBytes().reply(200, Buffer.from("wxyz"));
  httpbin.getBytes(32, (error, bytes) => {
    test.error(error);
    test.match(bytes.toString("hex"), "7778797a");
    scope.done();
    test.end();
  });
});

const codes = [401, 403, 429, 500, 503];
codes.forEach(code => {
  tap.test(`getBytes should handle HTTP ${code}`, {skip: false}, test => {
    const scope = mockBytes().reply(code);
    httpbin.getBytes(42, error => {
      test.ok(error);
      test.same(error.statusCode, code);
      scope.done();
      test.end();
    });
  });

  tap.test(`post should handle HTTP ${code}`, {skip: false}, test => {
    const scope = mockPost().reply(code);
    httpbin.post({a: 1}, error => {
      test.ok(error);
      test.same(error.statusCode, code);
      scope.done();
      test.end();
    });
  });
});

tap.test(`should handle low-level error`, {skip: false}, test => {
  const scope = mockBytes().replyWithError(new Error("unit-test-error"));
  httpbin.getBytes(42, error => {
    test.ok(error);
    test.notOk(error.statusCode);
    scope.done();
    test.end();
  });
});

tap.test("httpbin.post base case", test => {
  const scope = mockPost().reply(200, {
    data: JSON.stringify({foo: "unit-test"})
  });
  const body = {foo: "unit-test"};
  httpbin.post(body, (error, bodyOut) => {
    test.error(error);
    test.same(body, bodyOut);
    scope.done();
    test.end();
  });
});

tap.test(`httpbin.post should handle low-level error`, {skip: false}, test => {
  const scope = mockPost().replyWithError(new Error("unit-test-error"));
  httpbin.post({a: 1}, error => {
    test.ok(error);
    test.notOk(error.statusCode);
    scope.done();
    test.end();
  });
});

tap.test(
  `httpbin.post should handle invalid JSON response`,
  {skip: false},
  test => {
    const scope = mockPost().reply(200, {data: "{]"});
    httpbin.post({a: 1}, error => {
      test.ok(error);
      test.match(error.message, "Invalid JSON");
      scope.done();
      test.end();
    });
  }
);
