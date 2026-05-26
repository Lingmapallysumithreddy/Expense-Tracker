variable "vpc_id" {
  type        = string
  description = "The VPC ID where resources will be launched"
}

variable "public_subnet_id" {
  type        = string
  description = "The public subnet ID where the EC2 instance will be launched"
}

variable "instance_type" {
  type        = string
  default     = "t3.medium"
  description = "EC2 instance type for Jenkins server"
}

variable "key_name" {
  type        = string
  description = "EC2 Key Pair name for SSH access"
}

variable "env_prefix" {
  type        = string
  description = "Environment prefix for naming resources"
}
