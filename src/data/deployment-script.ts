import { DeployLogEntry } from "@/types/deployment";

// Nazwany typ pojedynczego kroku scenariusza - dzięki temu unikamy
// wieloliniowego typu generycznego, który potrafi pogubić parser TypeScript
type DeploymentStep = Omit<DeployLogEntry, "timestamp"> & {
  delayAfterMs: number;
};

// Symulowany przebieg "terraform apply" - każda linia ma level, wiadomość
// i opcjonalne opóźnienie (ms) przed wysłaniem KOLEJNEJ linii.
// To sprawia, że logi "płyną" w realistycznym tempie, a nie pojawiają się naraz.
export const DEPLOYMENT_SCRIPT: DeploymentStep[] = [
  { level: "command", message: "$ terraform init", delayAfterMs: 400 },
  { level: "info", message: "Initializing provider plugins... (aws, random, tls)", delayAfterMs: 600 },
  { level: "success", message: "Terraform has been successfully initialized!", delayAfterMs: 500 },
  { level: "command", message: "$ terraform plan -out=tfplan", delayAfterMs: 500 },
  { level: "info", message: "Refreshing state... [id=lb-1]", delayAfterMs: 350 },
  { level: "info", message: "Plan: 6 to add, 0 to change, 0 to destroy.", delayAfterMs: 600 },
  { level: "command", message: "$ terraform apply tfplan", delayAfterMs: 500 },

  { level: "info", message: "aws_lb.load_balancer: Creating...", nodeId: "lb-1", progress: 10, delayAfterMs: 700 },
  { level: "success", message: "aws_lb.load_balancer: Creation complete after 3s [id=lb-1]", nodeId: "lb-1", progress: 100, delayAfterMs: 500 },

  { level: "info", message: "aws_instance.app_server[0]: Creating...", nodeId: "compute-1", progress: 15, delayAfterMs: 600 },
  { level: "info", message: "aws_instance.app_server[1]: Creating...", nodeId: "compute-2", progress: 15, delayAfterMs: 500 },
  { level: "info", message: "aws_instance.app_server[0]: Still creating... [10s elapsed]", nodeId: "compute-1", progress: 55, delayAfterMs: 700 },
  { level: "info", message: "aws_instance.app_server[1]: Still creating... [10s elapsed]", nodeId: "compute-2", progress: 55, delayAfterMs: 500 },
  { level: "success", message: "aws_instance.app_server[0]: Creation complete after 14s [id=compute-1]", nodeId: "compute-1", progress: 100, delayAfterMs: 400 },
  { level: "success", message: "aws_instance.app_server[1]: Creation complete after 15s [id=compute-2]", nodeId: "compute-2", progress: 100, delayAfterMs: 500 },

  { level: "info", message: "aws_elasticache_cluster.redis: Creating...", nodeId: "cache-1", progress: 20, delayAfterMs: 700 },
  { level: "success", message: "aws_elasticache_cluster.redis: Creation complete after 6s [id=cache-1]", nodeId: "cache-1", progress: 100, delayAfterMs: 500 },

  { level: "info", message: "aws_db_instance.postgres: Creating...", nodeId: "db-1", progress: 10, delayAfterMs: 700 },
  { level: "warning", message: "aws_db_instance.postgres: Still creating... [30s elapsed]", nodeId: "db-1", progress: 45, delayAfterMs: 700 },
  { level: "warning", message: "aws_db_instance.postgres: Still creating... [60s elapsed]", nodeId: "db-1", progress: 75, delayAfterMs: 600 },
  { level: "success", message: "aws_db_instance.postgres: Creation complete after 68s [id=db-1]", nodeId: "db-1", progress: 100, delayAfterMs: 500 },

  { level: "info", message: "aws_s3_bucket.storage: Creating...", nodeId: "storage-1", progress: 30, delayAfterMs: 500 },
  { level: "success", message: "aws_s3_bucket.storage: Creation complete after 2s [id=storage-1]", nodeId: "storage-1", progress: 100, delayAfterMs: 500 },

  { level: "success", message: "Apply complete! Resources: 6 added, 0 changed, 0 destroyed.", delayAfterMs: 300 },
  { level: "info", message: "Outputs: load_balancer_dns = \"omniscale-lb-prod.eu-central-1.elb.amazonaws.com\"", delayAfterMs: 0 },
];