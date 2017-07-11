variable "account" {}

variable "region" {
  default = "us-east-1"
}

variable "build_dir" {
  default = "../.build"
}

provider "aws" {
  region = "${var.region}"
}

resource "aws_s3_bucket" "hexagonal-lambda-terraform3" {
  bucket = "hexagonal-lambda-terraform3" # sigh

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

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

// terraform {
//   backend "s3" {
//     bucket         = "hexagonal-lambda-terraform3"
//     key            = "terraform.tfstate"
//     region         = "us-west-2"
//     encrypt        = true
//     dynamodb_table = "hexagonal-lambda-terraform"
//   }
// }

resource "aws_api_gateway_rest_api" "hexagonal-lambda" {
  name        = "Hexagonal Lambda"
  description = "HTTP/JSON API endpoints for Hexagonal Lambda"
}

resource "aws_api_gateway_deployment" "hexagonal-lambda-dev" {
  rest_api_id = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
  stage_name  = "dev"
}
