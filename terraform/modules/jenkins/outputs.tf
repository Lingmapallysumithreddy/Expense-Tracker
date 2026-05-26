output "jenkins_public_ip" {
  value       = aws_instance.jenkins.public_ip
  description = "The public IP of the Jenkins server"
}

output "jenkins_instance_id" {
  value       = aws_instance.jenkins.id
  description = "The instance ID of the Jenkins server"
}
