output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.cafm_backend.id
}

output "elastic_ip" {
  description = "Elastic IP of CAFM backend"
  value       = aws_eip.cafm_backend_eip.public_ip
}

output "public_dns" {
  description = "Public DNS of CAFM backend"
  value       = aws_instance.cafm_backend.public_dns
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.cafm_backend_sg.id
}