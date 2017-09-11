output "api_url" {
  value = "https://${data.terraform_remote_state.global.aws_api_gateway_rest_api_id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_deployment.hexagonal-lambda-dev.stage_name}"
}
