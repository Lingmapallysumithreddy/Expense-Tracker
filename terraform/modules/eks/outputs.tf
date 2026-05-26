output "cluster_endpoint" {
  value       = aws_eks_cluster.this.endpoint
  description = "The endpoint for the EKS cluster API server"
}

output "cluster_ca_certificate" {
  value       = aws_eks_cluster.this.certificate_authority[0].data
  description = "The certificate authority data for the EKS cluster"
}

output "cluster_name" {
  value       = aws_eks_cluster.this.name
  description = "The name of the EKS cluster"
}

output "node_group_role_arn" {
  value       = aws_iam_role.nodes.arn
  description = "The ARN of the IAM role for the EKS worker nodes"
}
