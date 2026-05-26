output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "The ID of the VPC"
}

output "jenkins_public_ip" {
  value       = module.jenkins.jenkins_public_ip
  description = "The public IP of the Jenkins server"
}

output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "The name of the EKS cluster"
}

output "eks_cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "The API endpoint of the EKS cluster"
}

output "ecr_backend_repo_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "URL of the ECR repository for the backend service"
}

output "ecr_frontend_repo_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "URL of the ECR repository for the frontend service"
}

output "kubeconfig_update_command" {
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}"
  description = "CLI Command to configure local kubeconfig connection to EKS"
}
