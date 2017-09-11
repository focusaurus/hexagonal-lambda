provider "aws" {
  region = "${var.region}"
}

data terraform_remote_state global {
  backend = "s3"

  config {
    bucket = "hexagonal-lambda-demo-terraform"
    key    = "global/terraform.tfstate"
    region = "${var.region}"
  }
}

resource "aws_api_gateway_deployment" "hexagonal-lambda-demo" {
  rest_api_id = "${data.terraform_remote_state.global.aws_api_gateway_rest_api_id}"
  stage_name  = "${var.deploy}"
}
