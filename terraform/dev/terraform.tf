terraform {
  backend s3 {
    bucket         = "hexagonal-lambda-terraform"
    key            = "dev/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "hexagonal-lambda-dev-terraform"
  }
}
