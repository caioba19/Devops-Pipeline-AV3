output "pg_host" {
  description = "Host do serviço PostgreSQL"
  value       = aiven_pg.db.service_host
}

output "pg_port" {
  description = "Porta do serviço PostgreSQL"
  value       = aiven_pg.db.service_port
}

# Sensível: não aparece no log do pipeline. Para ler o valor, use o console da
# Aiven (Connection information) e monte a URI com o database criado aqui.
output "app_db_uri" {
  description = "URI de conexão com o database da aplicação (usar em AIVEN_DB_URL no Render)"
  value       = "postgres://${aiven_pg.db.service_username}:${aiven_pg.db.service_password}@${aiven_pg.db.service_host}:${aiven_pg.db.service_port}/${aiven_pg_database.app.database_name}?sslmode=require"
  sensitive   = true
}
