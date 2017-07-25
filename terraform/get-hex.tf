data aws_iam_policy_document get-hex {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:${var.region}:${var.account}:log-group:/aws/lambda/get-hex:*",
    ]
  }
}

module get-hex-lambda {
  function_name = "get-hex"
  source        = "./modules/lambda"
  policy_json   = "${data.aws_iam_policy_document.get-hex.json}"

  env = {
    HTTPBIN_URL = "${var.httpbin_url}"
  }
}

module get-hex-endpoint {
  account       = "${var.account}"
  function_name = "get-hex"
  lambda_arn    = "${module.get-hex-lambda.arn}"
  parent_id     = "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}"
  path          = "bytes"
  region        = "${var.region}"
  rest_api_id   = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  source        = "./modules/endpoint"
}
