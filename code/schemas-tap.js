"use strict";
const schemas = require("./schemas");
const tap = require("tap");

tap.test("schemas.define supports example data", test => {
  const ssn = schemas.define({
    type: "string",
    pattern: /^\d{3}-\d{2}-\d{4}$/.source,
    example: "111-22-3333"
  });
  test.same(ssn.openAPI().example, "111-22-3333");
  test.end();
});

tap.test("schemas.define supports example function", test => {
  const ssn = schemas.define({
    type: "string",
    pattern: /^\d{3}-\d{2}-\d{4}$/.source,
    example: () => "111-22-3333"
  });
  test.same(ssn.openAPI().example, "111-22-3333");
  test.end();
});
