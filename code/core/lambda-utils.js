"use strict";
const console =
  process.env.NODE_ENV === "test" ? require("null-console") : global.console;

exports.console = console;

function logStart(call, res, next) {
  const eventJson = JSON.stringify(call.event, null, 2);
  console.log(`${call.name} version ${call.version} starting. ${eventJson}`);
  // eslint-disable-next-line no-param-reassign
  call.local = {};
  next();
}
exports.logStart = logStart;

function httpError(statusCode, message) {
  const error = new Error(message || "Internal Server Error");
  error.statusCode = statusCode || 500;
  return error;
}
exports.httpError = httpError;

const headers = {
  "Content-Type": "application/json"
};

/* eslint-disable no-unused-vars */
// Need arity 4 function to be recognized by mintsauce as error handler
function errorHandler(_error, call, res, next) {
  /* eslint-enable no-unused-vars */
  const error = _error || {};
  const response = {
    statusCode: error.status || error.statusCode || 500,
    body: JSON.stringify(
      {message: error.message || "Internal Server Error"},
      null,
      2
    ),
    headers
  };
  console.log("Error handler sending", JSON.stringify(response));
  res.send(response);
}
exports.errorHandler = errorHandler;

function sendBody(call, res) {
  const statusCode = call.statusCode || 200;
  console.log(`Responding ${statusCode}`);
  res.send({
    statusCode,
    body: JSON.stringify(call.body || {}, null, 2),
    headers
  });
}
exports.sendBody = sendBody;

function validateEvent(schema) {
  return function validateEventInner(call, res, next) {
    // If we have a JSON string body (API Gateway endpoint), parse it first
    if (typeof call.event.body === "string") {
      try {
        // eslint-disable-next-line no-param-reassign
        call.event.body = JSON.parse(call.event.body);
      } catch (badJson) {
        const message = `Invalid JSON in request body. ${badJson.message}`;
        next(httpError(400, message));
        return;
      }
    }
    // Validate
    const error = schema.check(call.event);
    if (error) {
      res.send({
        statusCode: 400,
        body: JSON.stringify({message: error.message})
      });
      return;
    }
    next();
  };
}
exports.validateEvent = validateEvent;

function validateConfig(config) {
  return function validateConfigInner(call, res, next) {
    if (config.error) {
      next(
        new Error(
          `Invalid lambda environment variable configuration. ${config.error}`
        )
      );
      return;
    }
    next();
  };
}
exports.validateConfig = validateConfig;
