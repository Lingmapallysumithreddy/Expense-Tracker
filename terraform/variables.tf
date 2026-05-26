variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to deploy infrastructure"
}

variable "env_prefix" {
  type        = string
  default     = "production"
  description = "Prefix for resources naming (e.g. dev, staging, production)"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "VPC CIDR block"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
  description = "CIDR blocks for public subnets"
}

variable "private_subnet_cidrs" {
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
  description = "CIDR blocks for private subnets"
}

variable "availability_zones" {
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
  description = "Availability zones for subnet allocations"
}

variable "cluster_name" {
  type        = string
  default     = "finflow-eks-cluster"
  description = "EKS Cluster name"
}

variable "jenkins_key_name" {
  type        = string
  default     = "jenkins-ssh-key"
  description = "Name of the EC2 Key Pair to associate with the Jenkins host"
}

variable "jenkins_instance_type" {
  type        = string
  default     = "t3.small"
  description = "EC2 instance size for the Jenkins runner"
}

variable "eks_instance_types" {
  type        = list(string)
  default     = ["t3.small"]
  description = "Instance sizes for the EKS node group"
}
