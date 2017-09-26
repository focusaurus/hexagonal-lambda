#!/usr/bin/env node
"use strict";
const childProcess = require("child_process");
const glob = require("glob");
const path = require("path");
const touch = require("touch");

process.chdir(path.join(__dirname, ".."));

glob.sync(".build/*.js").forEach(bundleJs => {
  const bundleZip = `.build/${path.basename(bundleJs, ".js")}.zip`;
  touch.sync(bundleJs, {time: "1970-01-01"});
  childProcess.spawnSync("zip", ["-X", "-q", "-j", bundleZip, bundleJs]);
  console.log("✓", bundleZip);
});
