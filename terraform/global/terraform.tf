resource aws_s3_bucket hexagonal-lambda-terraform {
  bucket = "hexagonal-lambda-terraform"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Here's the command to create this table initially.
# I found getting terraform to both use this table for state locking AND
# create it didn't want to work
/*
aws dynamodb create-table \
  --table-name hl-global-terraform \
  --key-schema AttributeName=LockID,KeyType=HASH  \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
*/

terraform {
  backend s3 {
    bucket         = "hexagonal-lambda-terraform"
    key            = "global/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "hl-global-terraform"
  }
}
