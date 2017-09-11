locals {
  function_name = "get-hex"
}

data aws_iam_policy_document iam_policy_document {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:${var.region}:${var.account}:log-group:/aws/lambda/${local.function_name}:*",
    ]
  }
}

module get-hex-lambda {
  function_name = "${local.function_name}"
  prefix        = "${var.prefix}"
  source        = "../modules/lambda"
  policy_json   = "${data.aws_iam_policy_document.iam_policy_document.json}"

  env = {
    HTTPBIN_URL = "${var.httpbin_url}"
  }
}

module get-hex-endpoint {
  account       = "${var.account}"
  function_name = "${module.get-hex-lambda.function_name}"
  lambda_arn    = "${module.get-hex-lambda.arn}"
  parent_id     = "${data.terraform_remote_state.global.aws_api_gateway_root_resource_id}"
  path          = "bytes"
  region        = "${var.region}"
  rest_api_id   = "${data.terraform_remote_state.global.aws_api_gateway_rest_api_id}"
  source        = "../modules/endpoint"
}
