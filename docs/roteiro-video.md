# Roteiro do vídeo individual — Projeto 0

**Duração máxima:** 5 minutos. Cada integrante grava sua própria demonstração,
com a aplicação e as evidências acessíveis. O roteiro abaixo dura cerca de
4min30s; use os segundos restantes para transições, sem ultrapassar o limite.

## Preparação antes de gravar

- Abra a aplicação publicada no Render, já conectada ao PostgreSQL da Aiven.
- Deixe prontos um registro de teste para criar e as páginas do console da Aiven
  ou de um cliente SQL, do endpoint `/healthz` e das execuções no GitHub Actions.
- Na Aiven, abra o editor SQL e prepare uma consulta à tabela real do projeto,
  por exemplo `SELECT * FROM equipamentos ORDER BY id DESC LIMIT 10;`. Ajuste o
  nome da tabela e das colunas se forem diferentes.
- No GitHub Actions, deixe acessíveis a execução bem-sucedida do workflow do app
  (testes, deploy e health check) e a execução do Terraform usada para provisionar
  o banco. Se possível, mostre também o `plan` de um pull request e o `apply`
  aprovado na branch principal.
- Feche abas e oculte notificações. Não mostre tokens, senhas, URI de conexão,
  secrets, conteúdo de `.env` ou dados pessoais. Amplie a tela para que texto e
  resultados fiquem legíveis.
- Confirme que o registro usado é descartável. Se demonstrar exclusão, exclua
  apenas esse registro de teste.

## Roteiro cronometrado

### 0:00–0:25 — Apresentação e objetivo

**Na tela:** aplicação publicada no Render, na página principal.

**Fale:**

> “Olá, eu sou [nome], integrante da equipe [equipe]. Este é o Projeto 0, um
> sistema de controle de equipamentos de TI e laboratório. A aplicação foi
> desenvolvida em Flask, persiste os dados no PostgreSQL gerenciado na Aiven e
> tem sua infraestrutura provisionada com Terraform.”

### 0:25–1:35 — Formulário e operações CRUD

**Na tela:** mostre os campos do formulário. Preencha e envie um equipamento de
teste com dados fictícios, por exemplo nome “Notebook de demonstração”, tipo
“Notebook”, estado “Disponível” e localização “Laboratório”. Mostre o registro
na lista; abra a edição, altere um campo e salve. Se o tempo permitir, exclua o
registro de teste e mostre que saiu da lista.

**Fale enquanto executa:**

> “Vou cadastrar um equipamento de teste pelo formulário. Após salvar, ele
> aparece na listagem, que corresponde à consulta dos registros. Também posso
> editar seus dados e excluir um registro. Essas ações demonstram criar, ler,
> atualizar e excluir no sistema.”

**Evidência a deixar visível:** cadastro salvo e refletido na lista; edição
persistida. A exclusão é opcional se o tempo estiver curto.

### 1:35–2:10 — Persistência no PostgreSQL

**Na tela:** editor SQL do banco na Aiven, executando a consulta preparada. Encontre
o registro criado; não abra nem copie a URI ou a senha.

**Fale:**

> “Agora consulto a tabela diretamente no PostgreSQL da Aiven. O registro que
> cadastrei pela aplicação está armazenado no banco gerenciado, separado do
> processo Flask. Por isso os dados continuam disponíveis após reiniciar ou
> publicar novamente a aplicação.”

Se a exclusão foi demonstrada, atualize a consulta e mostre que o registro de
teste não está mais presente.

### 2:10–2:35 — Health check

**Na tela:** abra `https://[URL-DO-APP]/healthz` no navegador e mostre a resposta
HTTP `200` com `{"status":"ok"}`.

**Fale:**

> “A rota `/healthz` verifica a conexão com o banco. Com o PostgreSQL disponível,
> responde HTTP 200 e informa que o serviço está saudável. Se o banco não puder
> ser alcançado, a rota deve responder HTTP 503.”

Não derrube o banco para tentar demonstrar o caso 503; explique o comportamento
esperado sem interromper o serviço.

### 2:35–3:45 — GitHub Actions: testes e deploy

**Na tela:** GitHub → **Actions** → workflow **App - Testes e deploy** (ou o nome
real do workflow). Abra uma execução recente concluída com sucesso. Mostre os
jobs de lint/testes e deploy; no job de deploy, mostre a etapa do health check.

**Fale:**

> “O GitHub Actions automatiza a validação da aplicação. Esta execução mostra o
> lint e os testes passando. Depois, na atualização da branch principal, o
> workflow aciona o deploy no Render e verifica o `/healthz` antes de concluir.”

**Evidência:** status verde e etapas concluídas, sem abrir os valores de secrets.

### 3:45–4:25 — Terraform e provisionamento

**Na tela:** Actions → workflow do Terraform. Mostre o resultado do `plan` e a
execução de `apply` aprovada que criou o serviço PostgreSQL, o database e o
usuário. Se houver pouco tempo, mostre o `apply` concluído e diga que o plano é
validado em pull request.

**Fale:**

> “A infraestrutura também é tratada como código. O Terraform descreve o
> serviço PostgreSQL, o database e o usuário adicional. O plano é revisado antes
> da aplicação, e o `apply` na branch principal passa pela aprovação configurada.
> As credenciais ficam nos secrets do GitHub e na configuração protegida do
> Render, não no repositório.”

### 4:25–4:40 — Encerramento

**Na tela:** mantenha a execução bem-sucedida do Actions ou volte à aplicação.

**Fale:**

> “Com isso, demonstrei o CRUD de equipamentos, a gravação no PostgreSQL, o
> health check e a automação de testes, deploy e infraestrutura. Obrigado.”

## Conferência final

- [ ] Vídeo individual com até 5 minutos e apresentação do integrante.
- [ ] Formulário e operações de criar, listar, editar e, se possível, excluir
  demonstrados na aplicação publicada.
- [ ] Registro consultado diretamente no banco Aiven, sem exibir credenciais.
- [ ] `/healthz` mostrado respondendo HTTP 200; comportamento 503 explicado.
- [ ] Execução do Actions mostrando testes e deploy/health check concluídos.
- [ ] Execução do Terraform mostrando o `apply` aprovado e concluído.
- [ ] Nenhum token, senha, URI, secret ou dado pessoal aparece no vídeo.
- [ ] O nome da tabela, consulta, URL e rótulos da interface correspondem à
  versão final do projeto.
