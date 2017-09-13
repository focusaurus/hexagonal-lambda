terraform {
  backend s3 {
    bucket         = "hexagonal-lambda-terraform"
    key            = "demo/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "hexagonal-lambda-demo-terraform"
  }
}
