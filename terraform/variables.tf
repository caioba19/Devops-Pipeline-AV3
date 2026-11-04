variable "aiven_api_token" {
  description = "Token de API da Aiven. Vem do secret AIVEN_API_TOKEN do GitHub, nunca do código."
  type        = string
  sensitive   = true
}

variable "aiven_project" {
  description = "Nome do projeto na Aiven. Vem do secret AIVEN_PROJECT."
  type        = string
}

variable "cloud_name" {
  description = "Nuvem/região do serviço, no formato do console da Aiven. Vem da variável CLOUD_NAME do GitHub."
  type        = string
}

variable "pg_plan" {
  description = "Nome do plano GRATUITO do PostgreSQL, como aparece no console da Aiven. Vem da variável PG_PLAN."
  type        = string
}

variable "service_name" {
  description = "Nome do serviço PostgreSQL. Use o padrão equipe-<número>-pg. Vem da variável SERVICE_NAME."
  type        = string
}

variable "database_name" {
  description = "Nome do database da aplicação"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Nome do usuário adicional"
  type        = string
  default     = "app_user"
}
