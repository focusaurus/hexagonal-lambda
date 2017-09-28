#!/usr/bin/env node
"use strict";
const childProcess = require("child_process");
const output = require("../code/terraform-output");

const deploy = process.argv[2] || "dev";
const apiId = output("api_id", deploy);
const deployment = childProcess.spawnSync(
  "aws",
  [
    "apigateway",
    "create-deployment",
    "--rest-api-id",
    apiId,
    "--stage-name",
    deploy
  ],
  {stdio: "inherit"}
);
process.exit(deployment.status);
