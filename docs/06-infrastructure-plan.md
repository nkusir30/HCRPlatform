# Infrastructure Plan + Deployment + Maintenance
Docker compose (web, api, postgres, redis). GitHub Actions (lint/test/build/
migrate/deploy). Terraform for Azure/AWS (app service/ECS, managed PG, redis,
blob/S3, SES). Monitoring (OpenTelemetry + Grafana), logging (Loki/ELK),
backup (daily PITR, 30d) + DR (RPO 15m/RTO 4h). Env via secret manager, never
hardcoded. Maintenance: dependency Tuesdays, quarterly access reviews, annual
pen-test; runbooks for period-close, reminder storms, export backlogs.
