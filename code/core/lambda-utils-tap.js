"use strict";
const lambdaUtils = require("./lambda-utils");
const schemas = require("./schemas");
const tap = require("tap");
const sinon = require("sinon");

function stubRes() {
  return {
    send: sinon.spy(),
    error: sinon.spy()
  };
}

tap.test("lambdaUtils.validateEvent invalid event", test => {
  const schema = schemas.define({
    type: "object",
    required: ["count"],
    properties: {
      count: {
        type: "number"
      }
    }
  });
  const res = stubRes();
  const middleware = lambdaUtils.validateEvent(schema);
  const next = sinon.spy();
  middleware({event: {}}, res, next);
  tap.ok(res.send.calledOnce);
  const error = res.send.firstCall.args[0];
  tap.ok(error);
  tap.match(error.message, "required property 'count'");
  tap.same(error.statusCode, 400);
  test.end();
});

tap.test("lambdaUtils.validateConfig invalid", test => {
  const res = stubRes();
  const middleware = lambdaUtils.validateConfig({error: "unit-test-error"});
  const next = sinon.spy();
  middleware({event: {}}, res, next);
  tap.notOk(res.send.called);
  const error = next.firstCall.args[0];
  tap.ok(error);
  tap.match(error.message, "unit-test-error");
  test.end();
});

tap.test("lambdaUtils.validateEvent invalid body JSON", test => {
  const schema = schemas.define({
    type: "object",
    required: ["body"],
    properties: {
      body: {
        type: "object"
      }
    }
  });
  const middleware = lambdaUtils.validateEvent(schema);
  middleware({event: {body: "{not json..!"}}, {}, error => {
    tap.ok(error);
    tap.match(error.message, "Invalid JSON in request body");
    tap.same(error.statusCode, 400);
    test.end();
  });
});

tap.test("httpError should provide default message", {skip: false}, test => {
  const error = lambdaUtils.httpError();
  tap.match(error, {
    statusCode: 500,
    message: "Internal Server Error"
  });
  test.end();
});

tap.test("errorHandler no error case", {skip: false}, test => {
  const res = {
    send(response) {
      tap.match(response, {statusCode: 500});
      const body = JSON.parse(response.body);
      tap.match(body, {message: "Internal Server Error"});
      test.end();
    }
  };
  lambdaUtils.errorHandler(null, null, res);
});

tap.test("sendBody no body provided", {skip: false}, test => {
  const res = {
    send(response) {
      tap.match(response, {statusCode: 200});
      tap.same(response.body, "{}");
      test.end();
    }
  };
  lambdaUtils.sendBody({}, res);
});
