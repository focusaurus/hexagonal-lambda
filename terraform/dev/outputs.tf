output "api_url" {
  value = "https://${aws_api_gateway_rest_api.hexagonal-lambda.id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_deployment.api.stage_name}"
}

output "api_id" {
  value = "${aws_api_gateway_rest_api.hexagonal-lambda.id}"
}
