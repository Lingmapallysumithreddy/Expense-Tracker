variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets"
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private subnets"
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones to launch subnets"
}

variable "env_prefix" {
  type        = string
  description = "Environment prefix for naming resources"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster (used for subnet tags)"
}
