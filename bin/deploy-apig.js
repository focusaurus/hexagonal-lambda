#!/usr/bin/env node
"use strict";
const childProcess = require("child_process");
const path = require("path");

const deploy = process.argv[2] || "dev";
const apiId = childProcess.spawnSync("terraform", ["output", "api_id"], {
  cwd: process.chdir(path.join(__dirname, "..", "terraform", deploy)),
  stdio: ["pipe", "pipe", "inherit"]
});
if (apiId.status !== 0) {
  process.exit(apiId.status);
}
const deployment = childProcess.spawnSync(
  "aws",
  [
    "apigateway",
    "create-deployment",
    "--rest-api-id",
    apiId.stdout.toString().trim(),
    "--stage-name",
    deploy
  ],
  {stdio: "inherit"}
);
process.exit(deployment.status);
