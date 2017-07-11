#!/usr/bin/env node
"use strict";
/* eslint-disable no-template-curly-in-string */
const path = require("path");
const set = require("dot2val").set;
const terraform = require("./core/terraform");

const name = path.basename(__filename, "-tf.js");
const perms = [];

terraform.merge(
  exports,
  terraform.lambda(__filename, perms),
  terraform.endpoint({
    api: "hexagonal-lambda",
    cors: false,
    name,
    parent: "${aws_api_gateway_resource.bytes.id}",
    path: "/bytes",
    method: "GET"
  })
);

set(exports, `resource.aws_api_gateway_resource.bytes`, {
  rest_api_id: "${aws_api_gateway_rest_api.hexagonal-lambda.id}",
  parent_id: "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}",
  path_part: "bytes"
});

if (require.main === module) {
  console.log(JSON.stringify(exports, null, 2));
}
