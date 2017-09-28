variable function_name {}
variable policy_json {}
variable prefix {}

variable env {
  default = {
    TERRAFORM = "makes it hard to allow empty lambda env"
  }
}

variable memory_size {
  default = 128
}

variable timeout {
  default = 3
}

resource aws_iam_role iam_role {
  name = "${var.prefix}-${var.function_name}-assume-role-lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource aws_iam_policy iam_policy {
  policy = "${var.policy_json}"
  name   = "${var.prefix}-${var.function_name}-execution-policy"
}

resource aws_iam_role_policy_attachment iam_role_policy_attachment {
  role       = "${aws_iam_role.iam_role.name}"
  policy_arn = "${aws_iam_policy.iam_policy.arn}"
}

resource aws_lambda_function lambda_function {
  filename         = "../../.build/${var.function_name}.zip"
  function_name    = "${var.prefix}-${var.function_name}"
  handler          = "${var.function_name}.handler"
  memory_size      = "${var.memory_size}"
  role             = "${aws_iam_role.iam_role.arn}"
  runtime          = "nodejs6.10"
  source_code_hash = "${base64sha256(file("../../.build/${var.function_name}.zip"))}"
  timeout          = "${var.timeout}"

  environment = {
    variables = "${var.env}"
  }
}

output arn {
  value = "${aws_lambda_function.lambda_function.arn}"
}

output function_name {
  value = "${aws_lambda_function.lambda_function.function_name}"
}
