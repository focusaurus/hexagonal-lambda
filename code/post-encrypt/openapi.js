"use strict";

module.exports = {
  paths: {
    "/encrypt": {
      post: {
        summary: "Encrypt a JSON payload object",
        description:
          "Accepts an arbitrary JSON object, stringifies it, and encrypts with AES192 and a pre-shared secret, and encodes as BASE64.",
        parameters: [
          {
            description: "Arbitrary JSON object payload",
            in: "body",
            name: "body",
            required: true,
            schema: {type: "object"}
          }
        ],
        responses: {
          "200": {
            description: "",
            schema: {
              type: "object",
              required: ["encrypted"],
              properties: {
                encrypted: {
                  type: "string",
                  description: "Base64 AES192 ciphertext"
                }
              }
            }
          }
        }
      }
    }
  }
};
