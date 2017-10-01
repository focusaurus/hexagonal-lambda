output "api_url" {
  value = "${aws_api_gateway_deployment.api.invoke_url}"
}

output "api_id" {
  value = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
}
