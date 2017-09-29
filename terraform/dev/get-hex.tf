data aws_iam_policy_document iam_policy_document {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.prefix}-get-hex:*",
    ]
  }
}

module get-hex-lambda {
  function_name = "get-hex"
  policy_json   = "${data.aws_iam_policy_document.iam_policy_document.json}"
  prefix        = "${var.prefix}"
  source        = "../modules/lambda"

  env = {
    HTTPBIN_URL = "${var.httpbin_url}"
  }
}

module get-hex-endpoint {
  function_name = "get-hex"
  lambda_arn    = "${module.get-hex-lambda.arn}"
  parent_id     = "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}"
  path          = "bytes"
  prefix        = "${var.prefix}"
  region        = "${var.region}"
  rest_api_id   = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  source        = "../modules/endpoint"
}
