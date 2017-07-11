"use strict";
const configResolved = require.resolve("./config");
const orig = Object.assign({}, process.env);
const tap = require("tap");

// Note keep this code BEFORE the actual tests in the source code
tap.afterEach(done => {
  Object.assign(process.env, orig);
  done();
});

tap.test("config should error on invalid", test => {
  delete require.cache[configResolved];
  delete process.env.NODE_ENV;
  process.env.HTTPBIN_URL = "NOPE NOPE";
  const config = require("./config"); // eslint-disable-line global-require
  tap.ok(config.error, "Should expose error");
  test.end();
});

tap.test("config should error on missing required", test => {
  delete require.cache[configResolved];
  delete process.env.NODE_ENV;
  delete process.env.HTTPBIN_URL;
  const config = require("./config"); // eslint-disable-line global-require
  tap.ok(config.error, "Should expose error");
  test.end();
});
