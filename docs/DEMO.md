# Roteiro de demonstração — Server Side (API)

Este arquivo tem duas partes: o roteiro passo a passo (abaixo) e, ao final, a **Parte 2**, com os comentários que estavam no código, separados por arquivo.

Duração: cerca de 8 a 10 minutos. Tudo é feito no Swagger: http://localhost:3000/swagger-ui

## Antes de entrar na sala
1. MariaDB rodando (o `root` sem senha e o `.env` já configurados).
2. Para começar com dados limpos (opcional): no terminal do MariaDB, `DROP DATABASE n3_veiculos; CREATE DATABASE n3_veiculos;`.
3. Na pasta do projeto: `npm start`. Deve aparecer `API no ar: http://localhost:3000`.
4. Abra o Swagger em uma aba. O banco já vem com 5 proprietários e 10 veículos de exemplo.
5. Deixe aberto o código: `src/services/classificacao.js`, `src/services/veiculos.js`, `src/middleware/auth.js`.

Dados de exemplo da demo (já prontos para copiar):

| Item | Valor |
|---|---|
| Proprietário novo | CPF `12345678909`, nome `Pedro Demo`, fone `(47) 90000-0000` |
| Veículo popular | placa `dem-1a11`, preço `45000` |
| Veículo luxo (limite) | placa `DEM2B22`, preço `50000` |
| Veículo luxo | placa `DEM3C33`, preço `99999.99` |
| Veículo super luxo (limite) | placa `DEM4D44`, preço `100000` |
| Login | `admin` / `admin123` |

## 1. Visão geral (30 s)
Dizer: "É uma API REST em Node.js com Express. O ORM é o Sequelize, falando com MariaDB. A segurança é por token JWT. O proprietário tem um ou mais veículos, e o tipo do veículo (popular, luxo ou super luxo) é calculado pelo servidor a partir do preço."

## 2. Consulta pública, sem token (1 min)
1. Em **Veículos**, rode `GET /api/veiculos` (Try it out, Execute).
2. Dizer: "As consultas são públicas, qualquer cliente consegue ler. Quem altera dados precisa de token."

## 3. Rota negada sem token (1 min)
1. Ainda **sem** autenticar, rode `POST /api/veiculos` com qualquer corpo.
2. Resultado esperado: **401** com a mensagem "Token JWT ausente ou inválido".
3. Dizer: "O servidor barra qualquer escrita sem token válido. A verificação está em `src/middleware/auth.js`."

## 4. Login e JWT (1 min)
1. Em **Autenticação**, `POST /auth/login` com `{"username":"admin","senha":"admin123"}`.
2. Copie o valor de `token` da resposta.
3. Clique em **Authorize** (cadeado no topo), cole só o token (sem a palavra Bearer) e confirme.
4. Dizer: "O token é um JWT assinado com HS256 e expira em 1 hora. O servidor não guarda sessão. A senha no banco é um hash BCrypt, nunca texto puro. Se o usuário não existe ou a senha está errada, a resposta é a mesma (401), para não revelar quais usuários existem."
5. Opcional: repita o passo 3 agora, com token, e mostre que a mesma rota passa a ser aceita (o corpo vazio retorna 400 de validação, não 401).

## 5. CRUD de proprietário (1,5 min)
1. `POST /api/proprietarios` com `{"cpf":"12345678909","nome":"Pedro Demo","fone":"(47) 90000-0000"}`. Esperado: **201**.
2. `GET /api/proprietarios/12345678909`. Esperado: o proprietário com `qtdVeiculos: 0`.
3. `PUT /api/proprietarios/12345678909` com `{"cpf":"12345678909","nome":"Pedro Demo Editado","fone":"(47) 91111-1111"}`. Esperado: **200** com o nome novo.

## 6. CRUD de veículo e classificação (2,5 min)
Rode `POST /api/veiculos` quatro vezes. O campo `cpfProprietario` é sempre `12345678909` e o `modelo` pode ser qualquer texto.

| Placa | Preço | Tipo esperado na resposta |
|---|---|---|
| `dem-1a11` | 45000 | **popular** |
| `DEM2B22` | 50000 | **luxo** |
| `DEM3C33` | 99999.99 | **luxo** |
| `DEM4D44` | 100000 | **super luxo** |

Dizer: "Eu não envio o tipo, quem decide é o servidor. Menos de 50 mil é popular, de 50 mil até menos de 100 mil é luxo, e de 100 mil para cima é super luxo. Os limites 50000 e 100000 mostram que as faixas estão corretas. A regra está em `classificacao.js`, e o ORM grava o veículo ligado à linha da tabela `tipo_veiculo`." Reparar também que a placa `dem-1a11` voltou como `DEM1A11` (padronizada).

Atualização: `PUT /api/veiculos/DEM1A11` com `{"modelo":"Modelo DEM1A11","preco":120000,"cpfProprietario":"12345678909"}`. Esperado: o tipo muda para **super luxo**. Dizer: "Ao mudar o preço, o tipo é recalculado."

## 7. Consultas por proprietário e por tipo (1,5 min)
Estas são os GET, públicos:
- Por proprietário: `GET /api/veiculos?cpf=12345678909` (4 veículos), ou `GET /api/proprietarios/12345678909/veiculos`.
- Por tipo: `GET /api/veiculos?tipo=luxo`. Esperado: todos os veículos luxo do sistema (os de exemplo e os da demo).
- Combinada: `GET /api/veiculos?cpf=12345678909&tipo=super luxo`. Esperado: `DEM1A11` e `DEM4D44`.
- Tipo inexistente: `?tipo=xyz` retorna 400 com a mensagem explicando os tipos aceitos.

## 8. Validações e exclusão (1 min)
1. Placa duplicada: `POST /api/veiculos` com a placa `DEM2B22` outra vez. Esperado: **409**.
2. Placa inválida: `POST` com `"placa":"XX"`. Esperado: **400** listando o campo errado.
3. Excluir o proprietário com veículos: `DELETE /api/proprietarios/12345678909`. Esperado: **409** ("possui veículos").
4. Excluir um veículo: `DELETE /api/veiculos/DEM1A11`. Esperado: **204**. Depois `GET /api/veiculos/DEM1A11` retorna **404**.

## Perguntas que o professor pode fazer
- **Onde está o ORM?** Modelos em `src/models/index.js` (Proprietario tem muitos Veiculo; Veiculo pertence a um TipoVeiculo). O CRUD está em `src/services/veiculos.js`, sem escrever SQL na mão.
- **Onde está a regra do tipo?** `src/services/classificacao.js`, comparando em centavos para evitar erro de ponto flutuante.
- **Como o JWT funciona?** O login confere a senha com BCrypt e devolve um token assinado. Cada rota protegida chama o middleware `exigirToken`, que valida a assinatura e a validade. Só aceita o algoritmo HS256.
- **Por que as consultas são públicas?** Foi uma decisão do projeto: leitura aberta e escrita protegida. Para fechar tudo, basta aplicar `exigirToken` também nos GET.
- **O cliente pode ser outro, sem ser o Swagger?** Sim, é uma API REST comum. Há exemplos prontos em `requests.http` (VS Code com a extensão REST Client).
- **Onde ficam os segredos?** No `.env` (fora do Git). Em produção, trocar `JWT_SECRET` e a senha do admin.

## Se algo der errado
- **Porta ocupada:** defina `PORT=3001` no `.env` e abra o Swagger nessa porta.
- **Erro de conexão no `npm start`:** conferir se o MariaDB está rodando (ele aqui é um processo avulso, não serviço, e não volta sozinho após reiniciar o PC).
- **Token expirou (1 h):** faça login de novo e clique em Authorize outra vez.

## Parte 2 — Comentários do código, por arquivo

Os comentários foram retirados dos arquivos de código (JavaScript e SQL). Aqui estão eles, organizados por arquivo. Em cada item, o trecho em código mostra a linha que o comentário explicava e, logo abaixo, o texto do comentário. Serve de apoio para estudar e explicar o código na apresentação.

### `src/server.js`

- Trecho: `async function criarAdmin() {`
  > Cria o administrador na primeira execução; o hash BCrypt é gerado aqui, nunca escrito em SQL.

### `src/config/index.js`

- Trecho: `module.exports = {`
  > Configuração lida de variáveis de ambiente (ou do arquivo .env), com padrões para desenvolvimento.
  > Atenção: usa "??" e não "||" para aceitar senha vazia (ex.: root sem senha).

### `src/db/sequelize.js`

- Trecho: `const sequelize = new Sequelize(cfg.db.name, cfg.db.user, cfg.db.password, {`
  > ORM: Sequelize com o dialeto MariaDB.

- Trecho: `dialectOptions: { dateStrings: true, typeCast: true, timezone: 'local' },`
  > datas como texto "AAAA-MM-DD HH:MM:SS", exatamente como gravadas pelo banco

### `src/db/migrar.js`

- Trecho: `function dividirComandos(script) {`
  > Divide um script SQL em comandos respeitando "DELIMITER", que é necessário
  > para triggers e procedures (o mesmo script roda no HeidiSQL).

- Trecho: `if (/^\s*--/.test(linha)) continue;`
  > linhas só de comentário não entram nos comandos

- Trecho: `async function migrar() {`
  > Aplica, em ordem, os arquivos sql/NNN_*.sql ainda não aplicados (controle em schema_migrations).

### `src/db/consultasBd.js`

- Trecho: `const SQL_CONSULTA_1 = '`
  > Comandos SQL da atividade de Banco de Dados (consultas, views e procedures)
  > e as funções que os executam. O CRUD usa o ORM (Sequelize); aqui o SQL fica explícito.

- Trecho: `const SQL_CONSULTA_1 = '`
  > CONSULTA 1 (3 tabelas: veiculo, proprietario, tipo_veiculo)
  > Pergunta: quais veículos custam mais que a média da própria categoria, quem é o dono
  > e quanto acima da média eles estão?

- Trecho: `const SQL_CONSULTA_2 = '`
  > CONSULTA 2 (2 tabelas: tipo_veiculo, veiculo)
  > Pergunta: como está distribuída a frota por categoria (quantidade, menor, maior, média,
  > soma dos preços e participação %)?

- Trecho: `const SQL_CONSULTA_3 = '`
  > CONSULTA 3 (2 tabelas: proprietario, veiculo)
  > Pergunta: quais proprietários têm frota diversificada (veículos em pelo menos N categorias)?

- Trecho: `function linhasDoCall(resultado) {`
  > CALL devolve as linhas do SELECT da procedure (mais um pacote de status no fim).

- Trecho: `async procedure1(idTipo, percentual) {`
  > Executa a procedure de reajuste e devolve o parâmetro OUT (veículos afetados).

- Trecho: `return sequelize.transaction(async (transaction) => {`
  > transação = mesma conexão para o CALL e para ler a variável de sessão @afetados

### `src/models/index.js`

- Trecho: `dataCadastro: { type: DataTypes.STRING, field: 'data_cadastro' },`
  > Preenchidas pelos triggers do banco: o ORM só lê (nunca grava) estas colunas.

- Trecho: `Proprietario.hasMany(Veiculo, { foreignKey: 'cpfProprietario', as: 'veiculos' });`
  > Relacionamentos: um proprietário tem um ou mais veículos; cada veículo tem um tipo.

### `src/services/classificacao.js`

- Trecho: `function classificar(preco) {`
  > Regra do enunciado:
  > - preço < 50.000,00                  -> popular
  > - 50.000,00 <= preço < 100.000,00    -> luxo
  > - preço >= 100.000,00 (do contrário) -> super luxo
  > Compara em centavos inteiros para evitar erro de ponto flutuante.

### `src/services/veiculos.js`

- Trecho: `const CAMPOS_ESCRITA = ['placa', 'modelo', 'preco', 'cpfProprietario', 'idTipo'];`
  > Campos que o ORM grava. As datas ficam de fora: quem as preenche são os triggers.

- Trecho: `return Veiculo.findByPk(placa, { include: INCLUIR });`
  > findByPk de novo para trazer as datas preenchidas pelos triggers

- Trecho: `async function listar({ cpf, tipo } = {}) {`
  > Lista todos ou filtra por proprietário (cpf) e/ou tipo.

- Trecho: `{ modelo: modelo.trim(), preco, cpfProprietario: dono.cpf, idTipo: await idTipoPara(preco) },`
  > reclassifica

### `src/middleware/auth.js`

- Trecho: `function exigirToken(req, res, next) {`
  > Exige "Authorization: Bearer <token>" válido (assinatura e validade).

### `src/middleware/erros.js`

- Trecho: `class HttpError extends Error {`
  > Erro com status HTTP.

- Trecho: `const MENSAGENS_PROCEDURE = ['Tipo de veiculo inexistente', 'Proprietario nao encontrado', 'Pe…`
  > Mensagens de SIGNAL '45000' das procedures que são seguras para mostrar ao cliente.

- Trecho: `function tratarErros(err, req, res, next) {`
  > eslint-disable-next-line no-unused-vars

- Trecho: `console.error(err);`
  > Não devolve detalhes internos do banco ao cliente.

### `src/routes/schemas.js`

- Trecho: `veiculoAtualizacao: z.object({ modelo: z.string().trim().min(1).max(80), preco, cpfProprietari…`
  > A placa é a chave primária e não muda; para isso exclua e cadastre de novo.

### `src/routes/auth.js`

- Trecho: `const HASH_FALSO = bcrypt.hashSync('sem-usuario', 10);`
  > Hash fixo para gastar o mesmo tempo quando o usuário não existe (evita enumeração por tempo).

- Trecho: `router.post('/auth/login', async (req, res) => {`
  > Login: devolve um token JWT para usar em "Authorization: Bearer ...".

### `src/routes/proprietarios.js`

- Trecho: `router.get('/:cpf/veiculos', async (req, res) => {`
  > Consulta: veículos de um proprietário (opcionalmente filtrados por tipo).

### `src/routes/veiculos.js`

- Trecho: `router.get('/', async (req, res) => {`
  > Lista todos ou filtra por proprietário (?cpf=) e/ou tipo (?tipo=popular|luxo|super luxo).

### `src/routes/bd.js`

- Trecho: `const resultado = (item, objetivo, sql, linhas) => ({ item, objetivo, sql, totalLinhas: linhas…`
  > Resposta padrão dos itens de BD: objetivo, SQL executado e linhas (ótimo para os prints).

- Trecho: `router.get('/consultas/1', async (req, res) => res.json(resultado('Consulta 1 (3 tabelas)',`
  > Consultas complexas

- Trecho: `router.get('/views/1', async (req, res) => res.json(resultado('View 1 - vw_patrimonio_propriet…`
  > Views

- Trecho: `router.get('/triggers/1/:placa', async (req, res) => res.json(resultado('Trigger 1 - trg_veicu…`
  > Triggers (o efeito é provocado por POST/PUT em /api/veiculos)

- Trecho: `router.post('/procedures/1', exigirToken, async (req, res) => {`
  > Procedures

- Trecho: `router.post('/procedures/1', exigirToken, async (req, res) => {`
  > Procedure 1 altera dados, por isso exige token JWT.

### `src/openapi.js`

- Trecho: `const json = (schema) => ({ content: { 'application/json': { schema } } });`
  > Especificação OpenAPI usada pelo Swagger UI (rota /swagger-ui).

### Scripts SQL (`sql/`)

#### `sql/001_criar_tabelas.sql`

- Trecho: `CREATE TABLE tipo_veiculo (`
  > N3 - Server Side + Banco de Dados
  > Autores: Pedro Gabriel Hollas e João Pedro Cardozo - Engenharia de Software
  > V1: estrutura das tabelas (MariaDB)

- Trecho: `CREATE TABLE historico_preco (`
  > Auditoria de preço e tipo (alimentada pelo trigger trg_veiculo_au_historico).
  > Sem FK para veiculo de propósito: o histórico continua existindo se o veículo for excluído.

- Trecho: `CREATE TABLE usuario (`
  > Usuários da API (login com JWT). A senha é guardada com hash BCrypt.

#### `sql/002_triggers.sql`

- Trecho: `DELIMITER $$`
  > V2: TRIGGERS

- Trecho: `DELIMITER $$`
  > Trigger 1 - trg_veiculo_bi_padroniza
  > Objetivo: antes de inserir um veículo, padroniza a placa (maiúsculas,
  > sem hífen e sem espaços) e preenche automaticamente as datas de
  > cadastro e de atualização. Garante a regra mesmo para inserts feitos
  > fora da API (ex.: direto pelo HeidiSQL).

- Trecho: `DELIMITER $$`
  > Trigger 2 - trg_veiculo_au_historico
  > Objetivo: depois de atualizar um veículo, se o preço ou o tipo mudou,
  > grava uma linha em historico_preco (auditoria), com valores antigo e
  > novo, data e o usuário do banco que fez a alteração.

- Trecho: `DELIMITER $$`
  > Complemento (não é um dos dois triggers avaliados): mantém data_atualizacao.

#### `sql/003_views.sql`

- Trecho: `CREATE OR REPLACE VIEW vw_patrimonio_proprietario AS`
  > V3: VIEWS

- Trecho: `CREATE OR REPLACE VIEW vw_patrimonio_proprietario AS`
  > View 1 - vw_patrimonio_proprietario
  > Objetivo: painel de patrimônio por proprietário. Para cada dono mostra
  > quantos veículos tem em cada categoria, o valor total da frota, o
  > valor médio e o veículo mais caro. Inclui donos sem veículo (LEFT JOIN).
  > Usuário-alvo: área comercial / atendimento.

- Trecho: `CREATE OR REPLACE VIEW vw_historico_precos AS`
  > View 2 - vw_historico_precos
  > Objetivo: relatório de auditoria legível. Junta o histórico gravado
  > pelo trigger com o veículo, o dono e os nomes dos tipos antigo/novo,
  > calculando a variação em reais e em percentual.
  > Usuário-alvo: auditoria / gestor.

#### `sql/004_procedures.sql`

- Trecho: `DELIMITER $$`
  > V4: STORED PROCEDURES

- Trecho: `DELIMITER $$`
  > Procedure 1 - sp_reajustar_precos_tipo(p_id_tipo, p_percentual, OUT p_afetados)
  > Objetivo: reajusta (UPDATE) em p_percentual % o preço de todos os
  > veículos de uma categoria e, em seguida, reclassifica cada veículo
  > reajustado conforme a regra de preço (popular < 50 mil; luxo de 50 mil
  > a menos de 100 mil; super luxo >= 100 mil). Roda em transação e
  > devolve quantos veículos foram afetados. Cada mudança dispara o
  > trigger de histórico.
  > Exemplo: CALL sp_reajustar_precos_tipo(1, 10.00, @qtd); SELECT @qtd;

- Trecho: `DROP TEMPORARY TABLE IF EXISTS tmp_reajuste;`
  > Tabela temporária com as placas reajustadas e o novo preço já calculado

- Trecho: `DELIMITER $$`
  > Procedure 2 - sp_relatorio_proprietario(p_cpf)
  > Objetivo: relatório reutilizável da frota de um proprietário. Para
  > cada veículo traz o tipo, a posição do veículo no ranking de preço do
  > dono, quanto ele representa do patrimônio total, a média de preço da
  > categoria no sistema inteiro e a diferença do veículo para essa média.
  > Usa CTE, JOINs, agregação e funções de janela.
  > Exemplo: CALL sp_relatorio_proprietario('52998224725');

#### `sql/005_dados_exemplo.sql`

- Trecho: `INSERT INTO proprietario (cpf, nome, fone) VALUES`
  > V5: dados de exemplo para os testes e prints
  > (CPFs gerados apenas para teste, com dígitos verificadores válidos)
  > O tipo já segue a regra de preço; a placa é padronizada pelo trigger 1.

- Final do arquivo
  > Eduarda Martins fica sem veículo de propósito (aparece com zero na view 1).
