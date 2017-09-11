output aws_api_gateway_rest_api_id {
  value = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
}

output aws_api_gateway_root_resource_id {
  value = "${aws_api_gateway_rest_api.hexagonal-lambda.root_resource_id}"
}

# output terraform_bucket {
#   value = "${aws_s3_bucket.hexagonal-lambda-terraform.bucket}"
# }

