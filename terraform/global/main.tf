variable region {
  default = "us-west-2"
}

provider "aws" {
  region = "${var.region}"
}

resource "aws_api_gateway_rest_api" "hexagonal-lambda" {
  name        = "Hexagonal Lambda"
  description = "HTTP/JSON API endpoints for Hexagonal Lambda"
}
