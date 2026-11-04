# Projeto 0 — CRUD sobre PostgreSQL gerenciado (Aiven + Terraform)

### 👥 Integrantes da Equipe
* **Caio Vinicius**
* **Daniel Oliveira**
* **Kauan Marinho**
* **Maicon Santos**
* **Yuri Sales**

---

### 📦 Tema do Projeto: Controle de Equipamentos de TI / Laboratório
Aplicação para gestão e inventário de equipamentos e periféricos dos laboratórios.
* **Entidade:** `equipamentos`
* **Campos da Entidade:**
  1. `nome` *(Texto)* — Ex.: Switch Cisco 24 Portas Gigabit
  2. `categoria` *(Texto)* — Ex.: Redes, Servidores, Periféricos
  3. `quantidade` *(Número Inteiro)* — **Campo não textual obrigatório**
  4. `status` *(Status)* — Disponível, Em Uso, Em Manutenção, Desativado

---

Tudo roda pelo navegador: você edita no GitHub e o Terraform roda no GitHub
Actions. Nada é instalado no seu computador.

## O que há aqui

```
.
├── terraform/                 # Infraestrutura na Aiven
│   ├── main.tf                # provider, serviço PostgreSQL, database e usuário
│   ├── variables.tf           # entradas (sem valores sensíveis)
│   ├── outputs.tf             # saídas (a URI é sensível)
│   └── backend.tf             # state remoto (veja a seção "State remoto")
├── app/                       # Aplicação Flask (CRUD) e testes
│   ├── app.py  db.py          # rotas e acesso ao banco
│   ├── templates/  static/
│   ├── tests/test_app.py
│   ├── Dockerfile  requirements.txt  .env.example
├── .github/workflows/
│   ├── terraform-plan.yml     # pull request: fmt, validate, plan
│   ├── terraform-apply.yml    # main: apply, só após aprovação
│   ├── terraform-destroy.yml  # manual: remove tudo
│   └── app-ci-cd.yml          # testes, deploy no Render, health check
├── docs/
│   ├── adr-001.md             # modelo do ADR (a equipe preenche)
│   └── arquitetura.md         # diagrama (a equipe revisa e completa)
└── CHECKLIST.md               # critérios de aceite para marcar antes de entregar
```

## Passo a passo

### 1. Criar o repositório da equipe
Na página do repositório-modelo, clique em **Use this template → Create a new
repository**. Prefira repositório **público**: o *Required reviewers* dos
Environments (passo 5) só funciona em repositório privado nos planos pagos, e
repositórios públicos não têm limite de minutos do Actions.

### 2. Aiven: conta, projeto e token
1. Crie a conta em [aiven.io](https://aiven.io) e um **Project**. Anote o nome.
2. Em **User information → Authentication tokens**, gere um **API token**.
3. Descubra os valores exatos que o Terraform vai usar: na tela de criar
   serviço PostgreSQL, anote o **nome do plano gratuito** e o **nome da
   nuvem/região** (por exemplo `google-southamerica-east1`). Não confirme a
   criação por lá; o Terraform fará isso.

### 3. State remoto (GitLab, conta gratuita)
O state do Terraform precisa sobreviver entre as execuções do pipeline. Sem
isso, o segundo `apply` tenta recriar o banco e falha. Este modelo usa o
estado gerenciado do GitLab (o professor pode indicar outro backend; nesse
caso, só `terraform/backend.tf` e as variáveis `TF_HTTP_*` dos workflows mudam).

1. Crie uma conta em [gitlab.com](https://gitlab.com) e um projeto vazio
   (**New project → Create blank project**). Anote o **Project ID**
   (Settings → General).
2. Em **User settings → Access tokens**, crie um token com o escopo `api`.
3. Monte o endereço do state (o último trecho é um nome livre, por exemplo
   `equipe-01`):
   `https://gitlab.com/api/v4/projects/<PROJECT_ID>/terraform/state/equipe-01`

### 4. Secrets e variáveis no GitHub
Em **Settings → Secrets and variables → Actions**:

**Aba Secrets**

| Secret | Valor |
|---|---|
| `AIVEN_API_TOKEN` | Token da Aiven (passo 2) |
| `AIVEN_PROJECT` | Nome do projeto na Aiven |
| `TF_STATE_ADDRESS` | Endereço do state (passo 3) |
| `TF_STATE_USERNAME` | Seu usuário do GitLab |
| `TF_STATE_PASSWORD` | O token do GitLab |
| `RENDER_DEPLOY_HOOK_URL` | Deploy hook do Render (passo 7) |
| `APP_HEALTHCHECK_URL` | URL pública do app, sem barra no fim (passo 7) |

**Aba Variables** (não são sensíveis)

| Variable | Valor |
|---|---|
| `PG_PLAN` | Nome do plano **gratuito** do PostgreSQL (passo 2) |
| `CLOUD_NAME` | Nuvem/região (passo 2) |
| `SERVICE_NAME` | `equipe-<número>-pg`, por exemplo `equipe-01-pg` |

### 5. Environment com aprovação
Em **Settings → Environments → New environment**, crie `production` e marque
**Required reviewers** com pelo menos um colega. É isso que impede o `apply`
de rodar sem aprovação.

### 6. Criar o banco
1. Aba **Actions → Terraform - Apply (main, com aprovação) → Run workflow**.
2. Aprove o job quando o GitHub pedir (botão **Review deployments**).
3. Acompanhe o resultado e confira o serviço no console da Aiven. Esse é o
   **checkpoint 1**: tire um print do console e guarde o link da execução.

### 7. Publicar a aplicação no Render
1. Crie conta em [render.com](https://render.com).
2. **New → Web Service**, aponte para o repositório, **Language: Docker**,
   **Root Directory: `app`**.
3. Em **Environment**, crie `AIVEN_DB_URL`. Copie a URI do serviço no console
   da Aiven (Overview → Service URI) e troque `defaultdb` por `appdb`
   (o valor da variável `database_name`).
4. Em **Settings**, informe **Health Check Path: `/healthz`** e desative o
   **Auto-Deploy** (o deploy passa a ser feito pelo pipeline).
5. Copie o **Deploy Hook** e cole no secret `RENDER_DEPLOY_HOOK_URL`; cole a
   URL pública do serviço em `APP_HEALTHCHECK_URL`.

### 8. Trabalhar com pull requests
- Mudanças em `terraform/**`: abra um pull request. O workflow **Terraform -
  Plan** roda `fmt`, `validate` e `plan`, e mostra o plano no resumo da
  execução. Depois do merge na `main`, o **Apply** pede aprovação.
- Mudanças em `app/**`: o workflow **App - Testes e deploy** sobe um PostgreSQL
  de teste, roda lint e testes e, na `main`, faz o deploy e o health check.

### 9. Destruir tudo (depois da nota)
**Actions → Terraform - Destroy (manual) → Run workflow**, digite `DESTRUIR`
e aprove. Teste isso antes da entrega para provar que funciona.

## O que a equipe deve adaptar

- **Tema da aplicação:** troque `titulo` e `descricao` pelos campos do seu tema
  em `app/db.py` e nos templates, e atualize os testes.
- **Nome do serviço** (`SERVICE_NAME`) e do database (`database_name`).
- **`docs/adr-001.md`:** escreva a decisão e compare ao menos duas alternativas.
- **`docs/arquitetura.md`:** revise o diagrama e acrescente o que sua equipe mudou.
- **Este README:** ao final, ele deve permitir que outra equipe reproduza o
  projeto em menos de 1 hora.

## Observações importantes

- **Usuário da aplicação:** no PostgreSQL 15 ou superior, um usuário novo não
  pode criar tabelas no schema `public`. Por isso a aplicação conecta com o
  usuário administrador do serviço (`avnadmin`), como na URI do passo 7. O
  usuário criado pelo Terraform (`aiven_pg_user`) serve para praticar gestão de
  acesso; conceder privilégios a ele é um desafio extra, que exige SQL
  (`GRANT`) além do Terraform.
- **Serviço gratuito desligado:** a Aiven pode desligar serviços gratuitos sem
  uso. Se o banco sumir, ligue-o de novo no console e repita o teste.
- **Segredo vazou?** Revogue o token na hora, gere outro e corrija o código.
  Nunca commite `.env`, `*.tfvars` ou state.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| A aba Actions não lista os workflows | Arquivos fora de `.github/workflows` ou repositório errado | Conferir o caminho e o repositório aberto |
| Execução em "Queued" por muito tempo | Fila do GitHub ou limite de minutos de repositório privado | Aguardar alguns minutos; se persistir, usar repositório público |
| `terraform init` falha no backend | Secret `TF_STATE_*` vazio ou token sem escopo `api` | Conferir o endereço, o usuário e o token do GitLab |
| Erro de plano inválido | Nome do plano gratuito diferente | Copiar o nome exato do console para `PG_PLAN` |
| "Already exists" no `apply` | State não foi guardado | Revisar o passo 3 |
| O job de apply nunca começa | Aguardando aprovação do Environment | Abrir a execução e clicar em **Review deployments** |
| O app não conecta | URI incompleta ou com `defaultdb` | Usar a URI completa, com `appdb` e `sslmode=require` |
