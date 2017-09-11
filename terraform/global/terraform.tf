resource aws_s3_bucket hexagonal-lambda-terraform {
  bucket = "hexagonal-lambda-terraform"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

#
# resource aws_dynamodb_table hexagonal-lambda-global-terraform {
#   name           = "hexagonal-lambda-global-terraform"
#   read_capacity  = 1
#   write_capacity = 1
#   hash_key       = "LockID"
#
#   attribute {
#     name = "LockID"
#     type = "S"
#   }
# }

terraform {
  backend s3 {
    bucket         = "hexagonal-lambda-terraform"
    key            = "global/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "hexagonal-lambda-global-terraform"
  }
}
