terraform {
  required_version = ">= 1.6"

  required_providers {
    aiven = {
      source  = "aiven/aiven"
      version = "~> 4.0"
    }
  }
}

provider "aiven" {
  api_token = var.aiven_api_token
}

# Serviço PostgreSQL gerenciado (plano gratuito: veja o nome do plano no console da Aiven)
resource "aiven_pg" "db" {
  project      = var.aiven_project
  cloud_name   = var.cloud_name
  plan         = var.pg_plan
  service_name = var.service_name
}

# Database da aplicação dentro do serviço
resource "aiven_pg_database" "app" {
  project       = var.aiven_project
  service_name  = aiven_pg.db.service_name
  database_name = var.database_name
}

# Usuário adicional (prática de gestão de acesso).
# Atenção: no PostgreSQL 15+ um usuário novo não pode criar tabelas no schema
# public, por isso a aplicação deste modelo conecta com o usuário administrador
# (ver output app_db_uri). Conceder privilégios ao usuário é um desafio extra.
resource "aiven_pg_user" "extra" {
  project      = var.aiven_project
  service_name = aiven_pg.db.service_name
  username     = var.db_username
}
