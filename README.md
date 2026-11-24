# API de Proprietários e Veículos — N3 (Server Side + Banco de Dados)

Autor: **Pedro Gabriel Hollas** — Engenharia de Software.

Um único projeto em **Node.js** atende às duas disciplinas:

* **Server Side:** API REST (Express) com ORM (Sequelize), CRUD completo, consulta de veículos por proprietário e por tipo, e JWT.
* **Banco de Dados:** 3 consultas complexas, 2 views, 2 triggers e 2 stored procedures sobre o mesmo banco (MariaDB), cada uma executada por uma rota da API (para os prints da entrega).

## Requisitos
* Node.js 20 ou mais novo (testado na linha 22; o seu PC tem a 24)
* MariaDB 10.6+ rodando em `localhost:3306`

## Como rodar (Windows)
1. Crie o banco e o usuário (no HeidiSQL ou `mariadb -u root -p`):
   ```sql
   CREATE DATABASE n3_veiculos CHARACTER SET utf8mb4;
   CREATE USER 'n3'@'localhost' IDENTIFIED BY 'n3senha';
   GRANT ALL ON n3_veiculos.* TO 'n3'@'localhost';
   ```
   **Usando o `root` sem senha?** Crie um arquivo `.env` na pasta do projeto (veja `.env.example`) com:
   ```
   DB_USER=root
   DB_PASSWORD=
   ```
   Também existem `DB_HOST`, `DB_PORT`, `DB_NAME` e `PORT`. O `.env` não vai para o Git.
2. Na pasta do projeto:
   ```
   npm install
   npm start
   ```
3. Abra http://localhost:3000/swagger-ui

Na primeira execução o servidor aplica os scripts de `sql/` (tabelas, triggers, views, procedures e dados de exemplo; o controle fica na tabela `schema_migrations`) e cria o usuário `admin` (senha `admin123`, configurável por `ADMIN_USER`/`ADMIN_PASSWORD`). Em uso real, troque `JWT_SECRET` e a senha do admin.

Os mesmos arquivos `sql/*.sql` podem ser colados no HeidiSQL para os prints do código SQL.

## Regra de classificação do tipo
| Preço | Tipo |
|---|---|
| < R$ 50.000,00 | popular |
| ≥ R$ 50.000,00 e < R$ 100.000,00 | luxo |
| ≥ R$ 100.000,00 | super luxo |

O cliente não informa o tipo: `src/services/classificacao.js` calcula e o ORM associa a linha de `tipo_veiculo`. Ao alterar o preço (PUT) o tipo é recalculado.

## Segurança (JWT)
`POST /auth/login` devolve o token. Enviar `Authorization: Bearer <token>`.
* **Públicas:** login, Swagger e todas as consultas (GET).
* **Exigem token:** POST/PUT/DELETE de proprietários e veículos e `POST /api/bd/procedures/1`.

No Swagger, clique em **Authorize** e cole o token.

## Rotas
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login (usuário/senha) → JWT |
| GET/POST | `/api/proprietarios` | Listar / criar |
| GET/PUT/DELETE | `/api/proprietarios/:cpf` | Buscar / alterar / excluir (409 se tiver veículos) |
| GET | `/api/proprietarios/:cpf/veiculos[?tipo=luxo]` | Veículos do proprietário |
| GET/POST | `/api/veiculos` | Listar (filtros `?cpf=` e `?tipo=`) / criar |
| GET/PUT/DELETE | `/api/veiculos/:placa` | Buscar / alterar / excluir |
| GET | `/api/bd/consultas/1`, `/2`, `/3?minCategorias=2` | Consultas complexas |
| GET | `/api/bd/views/1`, `/views/2` | Views |
| GET | `/api/bd/triggers/1/:placa`, `/triggers/2` | Efeito dos triggers |
| POST | `/api/bd/procedures/1` | `sp_reajustar_precos_tipo` (JWT) |
| GET | `/api/bd/procedures/2/:cpf` | `sp_relatorio_proprietario` |

`requests.http` tem exemplos de chamadas e `docs/ENTREGA.md` traz o roteiro dos prints.

## Estrutura
```
sql/                001 tabelas | 002 triggers | 003 views | 004 procedures | 005 dados
src/models          modelos Sequelize (ORM)
src/services        regras de negócio (CRUD via ORM)
src/db              conexão, migrations e consultasBd.js (SQL das consultas/views/procedures)
src/routes          rotas Express (auth, proprietarios, veiculos, bd)
src/middleware      JWT e tratamento de erros
test/               testes unitários (npm test)
```
