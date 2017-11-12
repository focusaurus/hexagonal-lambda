"use strict";
const schemas = require("../schemas");

module.exports = schemas.define({
  type: "object",
  example() {
    return {KEY1: "value1", KEY2: false};
  }
});
