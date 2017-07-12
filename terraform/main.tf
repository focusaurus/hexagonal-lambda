variable "account" {}

variable "httpbin_url" {
  default = "https://httpbin.org"
}

variable "region" {
  default = "us-west-2"
}

variable "build_dir" {
  default = "../.build"
}

provider "aws" {
  region = "${var.region}"
}

// resource "aws_s3_bucket" "hexagonal-lambda-terraform" {
//   bucket = "hexagonal-lambda-terraform"
//
//   versioning {
//     enabled = true
//   }
//
//   lifecycle {
//     prevent_destroy = true
//   }
// }

// terraform {
//   backend "s3" {
//     bucket         = "hexagonal-lambda-terraform"
//     key            = "terraform.tfstate"
//     encrypt        = true
//     dynamodb_table = "hexagonal-lambda-terraform"
//   }
// }

resource "aws_dynamodb_table" "hexagonal-lambda-terraform" {
  name           = "hexagonal-lambda-terraform"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

resource "aws_api_gateway_rest_api" "hexagonal-lambda" {
  name        = "Hexagonal Lambda"
  description = "HTTP/JSON API endpoints for Hexagonal Lambda"
}

resource "aws_api_gateway_deployment" "hexagonal-lambda-dev" {
  rest_api_id = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  stage_name  = "dev"
}
