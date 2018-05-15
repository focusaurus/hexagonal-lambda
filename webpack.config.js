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
  mode: "production",
  target: "node"
};

glob.sync(`${__dirname}/code/**/lambda.js`).forEach(lambdaPath => {
  const name = path.basename(path.dirname(lambdaPath));
  module.exports.entry[name] = lambdaPath;
});

// Allow `node webpack.config.js` to troubleshoot
if (require.main === module) {
  console.log(JSON.stringify(module.exports, null, 2));
}
