"use strict";
const schemas = require("../schemas");

module.exports = schemas.define({
  type: "object",
  required: ["hex"],
  properties: {
    hex: {
      type: "string",
      pattern: /^[0-9a-f]$/.source
    }
  },
  example() {
    return {hex: "00112233445566778899aabbccddeeff"};
  }
});
