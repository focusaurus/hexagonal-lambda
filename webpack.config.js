"use strict";
const glob = require("glob");
const path = require("path");

module.exports = {
  entry: {},
  output: {
    filename: "[name].js",
    path: `${__dirname}/.build`,
    libraryTarget: "commonjs2"
  },
  target: "node"
};

glob.sync(`${__dirname}/code/**/*-lambda.js`).forEach(lambdaPath => {
  module.exports.entry[path.basename(lambdaPath, "-lambda.js")] = lambdaPath;
});
