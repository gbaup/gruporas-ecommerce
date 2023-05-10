provider "aws" {
  region     = "${TF_VAR_AWS_SAK}"
  access_key = "${TF_VAR_AWS_AKID}"
  secret_key = "${TF_VAR_AWS_DEFAULT_REGION}"
  token = "${TF_VAR_AWS_SESSION_TOKEN}"
}