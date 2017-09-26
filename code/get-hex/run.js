"use strict";
const lambda = require("./lambda");

const event = {queryStringParameters: {size: "25"}};
lambda.handler(event, {}, console.log);
