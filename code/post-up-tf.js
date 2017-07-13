#!/usr/bin/env node
"use strict";
/* eslint-disable no-template-curly-in-string */
const config = require("./core/config");
const path = require("path");
const terraform = require("./core/terraform");

const name = path.basename(__filename, "-tf.js");
const perms = [];

terraform.merge(
  exports,
  terraform.lambda(__filename, perms, Object.keys(config)),
  terraform.endpoint({
    api: "hexagonal-lambda",
    cors: false,
    name,
    parent: "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}",
    path: "/up",
    method: "POST"
  })
);

if (require.main === module) {
  console.log(JSON.stringify(exports, null, 2));
}
