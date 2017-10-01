provider "aws" {
  region = "${var.region}"
}

data "aws_caller_identity" "current" {}

resource "aws_api_gateway_rest_api" "hexagonal-lambda" {
  name        = "Hexagonal Lambda ${var.deploy}"
  description = "HTTP/JSON API endpoints for Hexagonal Lambda"
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  stage_name  = "${var.deploy}"

  depends_on = [
    "module.get-hex-endpoint",
    "module.post-up-endpoint",
  ]

  # https://medium.com/coryodaniel/til-forcing-terraform-to-deploy-a-aws-api-gateway-deployment-ed36a9f60c1a
  variables {
    deployed_at = "${timestamp()}"
  }
}
