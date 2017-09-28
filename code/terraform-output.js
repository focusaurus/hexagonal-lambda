"use strict";
const childProcess = require("child_process");
const path = require("path");

function output(name = "api_url", deploy = "dev") {
  const child = childProcess.spawnSync("terraform", ["output", name], {
    cwd: path.join(__dirname, "..", "terraform", deploy),
    stdio: "pipe"
  });
  if (child.status !== 0) {
    throw new Error(`terraform output error: ${child.stderr.toString()}`);
  }
  return child.stdout.toString().trim();
}

module.exports = output;
