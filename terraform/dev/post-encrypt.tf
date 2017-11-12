data aws_iam_policy_document post-encrypt {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.prefix}-post-encrypt:*",
    ]
  }
}

module post-encrypt-lambda {
  function_name = "post-encrypt"
  policy_json   = "${data.aws_iam_policy_document.post-encrypt.json}"
  prefix        = "${var.prefix}"
  source        = "../modules/lambda"

  env = {
    HL_HTTPBIN_URL = "${var.hl_httpbin_url}"
    HL_SECRET1     = "${var.hl_secret1}"
  }
}

module post-encrypt-endpoint {
  function_name = "post-encrypt"
  http_method   = "POST"
  lambda_arn    = "${module.post-encrypt-lambda.arn}"
  parent_id     = "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}"
  path          = "encrypt"
  prefix        = "${var.prefix}"
  region        = "${var.region}"
  rest_api_id   = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  source        = "../modules/endpoint"
}

module post-encrypt-cors {
  resource_id = "${module.post-encrypt-endpoint.resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  source      = "../modules/cors"
}
