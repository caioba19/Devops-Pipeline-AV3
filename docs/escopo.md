# Escopo do sistema — Gestão de Laboratórios de TI e Equipamentos

## Objetivo

Desenvolver uma aplicação web simples para registrar e consultar equipamentos
de TI e de laboratório. O sistema oferece operações de criação, listagem,
edição e exclusão (CRUD), usando Flask para a aplicação e PostgreSQL gerenciado
na Aiven para persistir os dados. A solução é provisionada com Terraform e
publicada no Render como parte do Projeto 0 de DevOps.

## Dados mantidos

Cada registro representa um equipamento ou conjunto de equipamentos da mesma
categoria e possui os seguintes campos:

| Campo | Descrição e validação |
|---|---|
| **Nome** | Identificação legível do equipamento ou conjunto. Obrigatório e não pode conter apenas espaços. |
| **Categoria** | Tipo do item, por exemplo notebook, monitor, periférico ou equipamento de laboratório. Obrigatória. |
| **Quantidade** | Número inteiro de unidades disponíveis ou registradas. Deve ser zero ou maior. |
| **Status** | Situação atual: `Disponível`, `Em uso` ou `Em manutenção`. Deve corresponder a uma das opções permitidas. |

## Regras de negócio

1. Não é possível salvar um equipamento sem nome ou categoria.
2. A quantidade deve ser um número inteiro não negativo.
3. O status deve ser escolhido entre as opções definidas; não se aceitam valores
   livres fora da lista.
4. Um registro salvo pode ser consultado, editado ou excluído pela interface.
5. Os registros devem permanecer no PostgreSQL após reinício ou novo deploy da
   aplicação.

## Dentro do escopo

- Interface web responsiva e direta para cadastrar, listar, editar e excluir
  equipamentos.
- Persistência dos quatro campos definidos no PostgreSQL.
- Validação básica dos campos e apresentação dos registros cadastrados.
- Aplicação Flask publicada no Render, com rota `/healthz` para verificar a
  disponibilidade da conexão com o banco.
- Provisionamento do PostgreSQL com Terraform e automação de validação, testes e
  deploy pelo GitHub Actions, conforme a configuração do projeto.

## Fora do escopo

- Autenticação, cadastro de usuários, perfis ou permissões por pessoa.
- Interface visual complexa, aplicativo móvel ou experiência personalizada por
  usuário.
- Empréstimos e devoluções com histórico por pessoa, auditoria ou reserva de
  equipamentos.
- Alertas, relatórios avançados, integração com outros sistemas ou leitura de
  etiquetas por código de barras.
- Alta disponibilidade ou recuperação de desastre com garantias de produção.

O objetivo é demonstrar um CRUD funcional e os conceitos de infraestrutura como
código e CI/CD; o sistema não se destina à gestão crítica de um inventário real.
