variable rest_api_id {}
variable resource_id {}

resource aws_api_gateway_method OPTIONS {
  rest_api_id   = "${var.rest_api_id}"
  resource_id   = "${var.resource_id}"
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource aws_api_gateway_integration OPTIONS-200 {
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "OPTIONS"
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource aws_api_gateway_integration_response OPTIONS-200 {
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "OPTIONS"
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,GET,POST'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }

  response_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }

  // This took a long time to figure out. Don't remove.
  depends_on = ["aws_api_gateway_method_response.OPTIONS-200"]
}

resource aws_api_gateway_method_response OPTIONS-200 {
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "OPTIONS"
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "0"
    "method.response.header.Access-Control-Allow-Methods" = "0"
    "method.response.header.Access-Control-Allow-Headers" = "0"
  }
}
