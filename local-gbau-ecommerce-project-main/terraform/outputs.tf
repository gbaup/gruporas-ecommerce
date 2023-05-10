# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

output "rds_hostname" {
  description = "RDS instance hostname"
  value       = aws_db_instance.grupo_ras.address
  sensitive   = false
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.grupo_ras.port
  sensitive   = false
}

output "rds_username" {
  description = "RDS instance root username"
  value       = aws_db_instance.grupo_ras.username
  sensitive   = false
}

output "rds_password" {
  description = "RDS instance root password"
  value       = aws_db_instance.grupo_ras.password
  sensitive   = true
}

output "bucket_name" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.exampleGrupoRas.id
  sensitive   = false
}

output "bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.exampleGrupoRas.region
  sensitive   = false
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.exampleGrupoRas.arn
  sensitive   = false
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.exampleGrupoRas.bucket_domain_name
  sensitive   = false
}

output "AWS_AKID" {
  description = "AWS access key ID"
  value       = aws_db_instance.grupo_ras.password
  sensitive   = true
}