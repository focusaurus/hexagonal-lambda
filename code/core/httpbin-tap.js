"use strict";
const config = require("./config");
const httpbin = require("./httpbin");
const nock = require("nock");
const tap = require("tap");

function mockReq() {
  return nock(config.HTTPBIN_URL).get(/^\/bytes/i);
}

tap.test("httpbin.getBytes base case", test => {
  const scope = mockReq().reply(200, Buffer.from("wxyz"));
  httpbin.getBytes(32, (error, bytes) => {
    test.error(error);
    tap.match(bytes.toString("hex"), "7778797a");
    scope.done();
    test.end();
  });
});

const codes = [401, 403, 429, 500, 503];
codes.forEach(code => {
  tap.test(`should handle HTTP ${code}`, {skip: false}, test => {
    const scope = mockReq().reply(code);
    httpbin.getBytes(42, error => {
      tap.ok(error);
      tap.same(error.statusCode, code);
      scope.done();
      test.end();
    });
  });
});

tap.test(`should handle low-level error`, {skip: false}, test => {
  const scope = mockReq().replyWithError(new Error("unit-test-error"));
  httpbin.getBytes(42, error => {
    tap.ok(error);
    tap.notOk(error.statusCode);
    scope.done();
    test.end();
  });
});
