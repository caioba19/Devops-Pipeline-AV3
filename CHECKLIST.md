# Checklist de entrega — Projeto 0

Marque cada item só depois de verificar. Cole o link da evidência ao lado.

## Infraestrutura
- [ ] `terraform apply` a partir de um repositório limpo cria banco, database e usuário
- [ ] Nenhum valor fixo (token, senha, nome de projeto) nos arquivos `.tf`
- [ ] Outputs de senha e URI marcados como `sensitive`
- [ ] `terraform destroy` remove tudo o que foi criado

## Pipeline
- [ ] Todo pull request roda `fmt -check`, `validate` e `plan`
- [ ] O `apply` só roda na `main` e só depois da aprovação de um revisor
- [ ] O state persiste: duas execuções seguidas do `apply` não dão erro nem recriam o banco

## Aplicação
- [ ] A URL pública abre e permite criar, listar, editar e excluir
- [ ] Os dados continuam lá depois de reiniciar a aplicação
- [ ] `/healthz` responde 200 com banco ativo e 503 sem conexão

## Segurança e custo
- [ ] Todos os serviços usam plano gratuito, sem cartão cadastrado
- [ ] Nenhum segredo no histórico do Git (se houve, o token foi revogado)

## Documentação
- [ ] O README permite a outra equipe reproduzir o projeto em menos de 1 hora
- [ ] O ADR-001 compara pelo menos duas alternativas e justifica a escolha
- [ ] O diagrama mostra GitHub, Actions, Aiven, Render e o caminho dos segredos
