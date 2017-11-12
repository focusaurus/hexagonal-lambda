#!/usr/bin/env node
"use strict";
const {handler} = require("./lambda");
const event = require("./event-schema").example();

handler(event, {}, console.log);
