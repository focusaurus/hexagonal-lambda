"use strict";
const get = require("lodash.get");
const set = require("lodash.set");
const path = require("path");

function tableArn(name) {
  return `arn:aws:dynamodb:\${var.region}:\${var.account}:table/${name}`;
}
exports.tableArn = tableArn;

function policy(statements) {
  return {
    path: "/",
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: statements
    })
  };
}
exports.policy = policy;

function logStatement(name) {
  return {
    Effect: "Allow",
    Action: [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ],
    Resource: [
      `arn:aws:logs:\${var.region}:\${var.account}:log-group:/aws/lambda/${name}:*`
    ]
  };
}

function allowLambda(name) {
  return {
    name,
    assume_role_policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: "sts:AssumeRole",
          Principal: {
            Service: "lambda.amazonaws.com"
          },
          Effect: "Allow",
          Sid: ""
        }
      ]
    })
  };
}

function lambda(lambdaJs, perms, envVars = [], extra = {}) {
  // lambaJs is __filename like /blah/code/example-lambda.js
  const name = path.basename(lambdaJs, "-tf.js");
  const obj = {};
  set(obj, `resource.aws_lambda_function.${name}`, {
    filename: `\${var.build_dir}/${name}.zip`,
    function_name: name,
    handler: `${name}.handler`,
    role: `\${aws_iam_role.${name}.arn}`,
    runtime: "nodejs6.10",
    source_code_hash: `\${base64sha256(file("\${var.build_dir}/${name}.zip"))}`,
    timeout: 10,
    memory_size: 512
  });
  envVars.forEach(varName => {
    // Sorry about this nasty syntax below. It's JS + terraform's fault.
    // We are trying to get this format:
    // {variables: {FOO_BAR: "${var.foo_bar}"}}
    set(
      obj,
      `resource.aws_lambda_function.${name}.environment.variables.${varName}`,
      `\${var.${varName.toLowerCase()}}`
    );
  });
  Object.assign(get(obj, `resource.aws_lambda_function.${name}`), extra);
  set(
    obj,
    `resource.aws_iam_policy.${name}`,
    policy(perms.concat([logStatement(name)]))
  );
  set(obj, `resource.aws_iam_role.${name}`, allowLambda(name));
  set(obj, `resource.aws_iam_role_policy_attachment.${name}`, {
    role: name,
    policy_arn: `\${aws_iam_policy.${name}.arn}`
  });
  return obj;
}
exports.lambda = lambda;

function variable(name) {
  const obj = {};
  set(obj, `variable.${name}`, {});
  return obj;
}
exports.variable = variable;

function endpoint(opts) {
  /* eslint-disable camelcase */
  const rest_api_id = `\${aws_api_gateway_rest_api.${opts.api}.id}`;
  const resource_id = `\${aws_api_gateway_resource.${opts.name}.id}`;
  const methodPath = `\${aws_api_gateway_method.${opts.name}-${opts.method}.http_method}`;
  const obj = {};
  set(obj, `resource.aws_api_gateway_resource.${opts.name}`, {
    // eslint-disable-next-line no-template-curly-in-string
    rest_api_id,
    parent_id: opts.parent,
    path_part: `${path.basename(opts.path)}`
  });
  const methodSettings = {
    authorization: "NONE",
    http_method: opts.method,
    resource_id,
    rest_api_id
  };
  if (opts.auth) {
    methodSettings.authorization = "CUSTOM";
    methodSettings.authorizer_id = opts.auth;
  }
  if (opts.auth === "AWS_IAM") {
    methodSettings.authorization = "AWS_IAM";
    delete methodSettings.authorizer_id;
  }
  set(
    obj,
    `resource.aws_api_gateway_method.${opts.name}-${opts.method}`,
    methodSettings
  );
  set(obj, `resource.aws_api_gateway_integration.${opts.name}-${opts.method}`, {
    rest_api_id,
    resource_id,
    http_method: methodPath,
    integration_http_method: "POST", // always POST
    type: "AWS_PROXY",
    uri: `arn:aws:apigateway:\${var.region}:lambda:path/2015-03-31/functions/\${aws_lambda_function.${opts.name}.arn}/invocations`
  });
  set(obj, `resource.aws_lambda_permission.${opts.name}`, {
    statement_id: "AllowExecutionFromAPIGateway",
    action: "lambda:InvokeFunction",
    function_name: `\${aws_lambda_function.${opts.name}.arn}`,
    principal: "apigateway.amazonaws.com",
    source_arn: `arn:aws:execute-api:\${var.region}:\${var.account}:\${aws_api_gateway_rest_api.${opts.api}.id}/*/${opts.method}${opts.path}`
  });

  if (opts.cors === false) {
    return obj;
  }
  // CORS setup
  const http_method = "OPTIONS";
  const status_code = "200";

  set(obj, `resource.aws_api_gateway_method.${opts.name}-OPTIONS`, {
    rest_api_id,
    resource_id,
    http_method,
    authorization: "NONE"
  });
  set(obj, `resource.aws_api_gateway_integration.${opts.name}-OPTIONS-200`, {
    rest_api_id,
    resource_id,
    http_method,
    type: "MOCK",

    request_templates: {
      "application/json": JSON.stringify({statusCode: 200})
    }
  });
  set(
    obj,
    `resource.aws_api_gateway_integration_response.${opts.name}-OPTIONS-200`,
    {
      rest_api_id,
      resource_id,
      http_method,
      status_code,
      depends_on: [`aws_api_gateway_integration.${opts.name}-OPTIONS-200`],

      response_parameters: {
        "method.response.header.Access-Control-Allow-Origin": "'*'",
        "method.response.header.Access-Control-Allow-Methods": `'OPTIONS,${opts.method}'`,
        "method.response.header.Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      },

      response_templates: {
        "application/json": '{"statusCode": 200}'
      }
    }
  );
  set(
    obj,
    `resource.aws_api_gateway_method_response.${opts.name}-OPTIONS-200`,
    {
      rest_api_id,
      resource_id,
      http_method,
      status_code,
      response_models: {
        "application/json": "Empty"
      },

      response_parameters: {
        "method.response.header.Access-Control-Allow-Origin": "0",
        "method.response.header.Access-Control-Allow-Methods": "0",
        "method.response.header.Access-Control-Allow-Headers": "0"
      }
    }
  );

  return obj;
}
exports.endpoint = endpoint;

exports.merge = require("lodash.merge");
