data "aws_caller_identity" "current" {}
variable function_name {}
variable lambda_arn {}
variable parent_id {}
variable path {}
variable prefix {}
variable region {}
variable rest_api_id {}

variable authorizer_id {
  default = ""
}

variable authorization {
  default = "NONE"
}

variable http_method {
  default = "GET"
}

resource aws_iam_policy iam_policy {
  name = "${var.prefix}-${var.function_name}-endpoint-policy"

  policy = <<EOF
{
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.prefix}-${var.function_name}:*"
      ]
    }
  ],
  "Version": "2012-10-17"
}
EOF
}

resource aws_iam_role iam_role {
  name = "${var.prefix}-${var.function_name}-assume-role-endpoint"

  assume_role_policy = <<EOF
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}
EOF
}

resource aws_iam_role_policy_attachment iam_role_policy_attachment {
  role       = "${aws_iam_role.iam_role.name}"
  policy_arn = "${aws_iam_policy.iam_policy.arn}"
}

resource aws_api_gateway_resource api_gateway_resource {
  rest_api_id = "${var.rest_api_id}"
  parent_id   = "${var.parent_id}"
  path_part   = "${basename(var.path)}"
}

resource aws_api_gateway_method api_gateway_method {
  authorization = "${var.authorization}"
  authorizer_id = "${var.authorization == "CUSTOM" ? var.authorizer_id : ""}"
  http_method   = "${var.http_method}"
  resource_id   = "${aws_api_gateway_resource.api_gateway_resource.id}"
  rest_api_id   = "${var.rest_api_id}"
}

# TODO terraform does not understand the dependency that this aws_api_gateway_integration
# depends on the lambda function being created first
# Need to figure out a clean way to express the dependency, use depends_on, or something else
resource aws_api_gateway_integration api_gateway_integration {
  rest_api_id             = "${var.rest_api_id}"
  resource_id             = "${aws_api_gateway_resource.api_gateway_resource.id}"
  http_method             = "${aws_api_gateway_method.api_gateway_method.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"

  // uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.region}:${data.aws_caller_identity.current.account_id}:function:${var.function_name}/invocations"
  uri = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${var.lambda_arn}/invocations"
}

resource aws_lambda_permission lambda_pemission {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${var.lambda_arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${var.rest_api_id}/*/${var.http_method}/*"
}

output resource_id {
  value = "${aws_api_gateway_resource.api_gateway_resource.id}"
}
