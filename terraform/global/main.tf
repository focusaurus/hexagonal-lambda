variable region {
  default = "us-west-2"
}

provider "aws" {
  region = "${var.region}"
}
