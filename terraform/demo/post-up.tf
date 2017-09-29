data aws_iam_policy_document post-up {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.prefix}-post-up:*",
    ]
  }
}

module post-up-lambda {
  function_name = "post-up"
  policy_json   = "${data.aws_iam_policy_document.post-up.json}"
  prefix        = "${var.prefix}"
  source        = "../modules/lambda"

  env = {
    HTTPBIN_URL = "${var.httpbin_url}"
  }
}

module post-up-endpoint {
  function_name = "post-up"
  http_method   = "POST"
  lambda_arn    = "${module.post-up-lambda.arn}"
  parent_id     = "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}"
  path          = "up"
  prefix        = "${var.prefix}"
  region        = "${var.region}"
  rest_api_id   = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  source        = "../modules/endpoint"
}

module post-up-cors {
  resource_id = "${module.post-up-endpoint.resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  source      = "../modules/cors"
}
