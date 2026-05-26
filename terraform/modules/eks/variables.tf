variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "env_prefix" {
  type        = string
  description = "Environment prefix for naming resources"
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs for EKS node groups"
}

variable "instance_types" {
  type        = list(string)
  default     = ["t3.medium"]
  description = "EC2 instance types for EKS worker nodes"
}

variable "desired_capacity" {
  type        = number
  default     = 2
  description = "Desired number of worker nodes"
}

variable "max_capacity" {
  type        = number
  default     = 3
  description = "Maximum number of worker nodes"
}

variable "min_capacity" {
  type        = number
  default     = 1
  description = "Minimum number of worker nodes"
}
