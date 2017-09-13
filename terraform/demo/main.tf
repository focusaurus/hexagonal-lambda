provider "aws" {
  region = "${var.region}"
}

# data terraform_remote_state global {
#   backend = "s3"
#
#   config {
#     bucket = "hexagonal-lambda-terraform"
#     key    = "global/terraform.tfstate"
#     region = "${var.region}"
#   }
# }

resource "aws_api_gateway_rest_api" "hexagonal-lambda" {
  name        = "Hexagonal Lambda ${var.deploy}"
  description = "HTTP/JSON API endpoints for Hexagonal Lambda"
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  stage_name  = "${var.deploy}"

  # https://medium.com/coryodaniel/til-forcing-terraform-to-deploy-a-aws-api-gateway-deployment-ed36a9f60c1a
  variables {
    deployed_at = "${timestamp()}"
  }
}
