# Arquitetura

O diagrama abaixo usa Mermaid, que o GitHub desenha automaticamente. Revise-o e
acrescente o que sua equipe mudar.

```mermaid
flowchart LR
  Dev[Equipe edita no GitHub] --> Repo[(Repositório)]
  Repo -->|pull request| Plan[Actions: fmt, validate, plan]
  Repo -->|merge na main + aprovação| Apply[Actions: terraform apply]
  Apply -->|API da Aiven| PG[(PostgreSQL na Aiven)]
  Apply -->|state| State[(State remoto GitLab)]
  Repo -->|push em app/| CI[Actions: testes e deploy hook]
  CI --> Render[Render: aplicação Flask]
  Render -->|AIVEN_DB_URL| PG
  Usuario[Usuário] --> Render
```

## Caminho dos segredos

| Segredo | Onde fica | Quem usa |
|---|---|---|
| `AIVEN_API_TOKEN`, `AIVEN_PROJECT` | Secrets do GitHub | Workflows do Terraform |
| `TF_STATE_*` | Secrets do GitHub | Workflows do Terraform |
| `RENDER_DEPLOY_HOOK_URL`, `APP_HEALTHCHECK_URL` | Secrets do GitHub | Workflow do app |
| `AIVEN_DB_URL` | Variável de ambiente no Render | Aplicação |
