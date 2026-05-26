# Fetch the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Security Group for Jenkins Host
resource "aws_security_group" "jenkins" {
  name        = "${var.env_prefix}-jenkins-sg"
  description = "Security Group for Jenkins CI/CD EC2 Instance"
  vpc_id      = var.vpc_id

  # SSH
  ingress {
    description = "Allow SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins Web UI
  ingress {
    description = "Allow Jenkins Web Traffic"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Nginx / Web Traffic (for SSL/Proxy tests)
  ingress {
    description = "Allow HTTP Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress (All traffic outbound)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.env_prefix}-jenkins-sg"
  }
}

# Jenkins Server EC2 Instance
resource "aws_instance" "jenkins" {
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [aws_security_group.jenkins.id]
  associate_public_ip_address = true
  key_name                    = var.key_name

  # Provision tools automatically
  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              
              # Install Git
              sudo yum install git -y
              
              # Install Docker
              sudo amazon-linux-extras install docker -y || sudo yum install docker -y
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ec2-user
              
              # Install Jenkins
              sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
              sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
              sudo yum upgrade -y
              
              # Install Java (Jenkins requirement)
              sudo yum install java-17-amazon-corretto -y
              sudo yum install jenkins -y
              sudo systemctl start jenkins
              sudo systemctl enable jenkins
              sudo usermod -aG docker jenkins
              
              # Install kubectl
              curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
              sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
              
              # Restart Jenkins to apply group memberships
              sudo systemctl restart jenkins
              EOF

  tags = {
    Name = "${var.env_prefix}-jenkins-server"
  }
}
