# Here's the command to create this table initially.
# I found getting terraform to both use this table for state locking AND
# create it didn't want to work
/*
aws dynamodb create-table \
  --table-name hl-dev-terraform \
  --key-schema AttributeName=LockID,KeyType=HASH  \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
*/

terraform {
  backend s3 {
    bucket         = "hexagonal-lambda-terraform"
    key            = "dev/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "hl-dev-terraform"
  }
}
