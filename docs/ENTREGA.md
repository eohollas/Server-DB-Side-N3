# Roteiro para o PDF de entrega (BD, 26/11/2026)

Para cada item o PDF pede: (1) SQL, (2) objetivo, (3) resultado, (4) código da rota e da função de banco, (5) print da tela do sistema.
Use o Swagger (http://localhost:3000/swagger-ui): cada resposta mostra `objetivo`, `sql` e `linhas`, o que serve de print.
Para os triggers e procedures tire também um print do banco (HeidiSQL) antes e depois.

| Item | SQL (arquivo) | Rota | Rota (`src/routes/bd.js`) → função de banco (`src/db/consultasBd.js`) |
|---|---|---|---|
| Consulta 1 (3 tabelas) | `src/db/consultasBd.js` (`SQL_CONSULTA_1`) | `GET /api/bd/consultas/1` | `consultas/1` → `consulta1` |
| Consulta 2 (2 tabelas) | `SQL_CONSULTA_2` | `GET /api/bd/consultas/2` | `consultas/2` → `consulta2` |
| Consulta 3 (2 tabelas) | `SQL_CONSULTA_3` | `GET /api/bd/consultas/3` | `consultas/3` → `consulta3` |
| View 1 `vw_patrimonio_proprietario` | `sql/003_views.sql` | `GET /api/bd/views/1` | `views/1` → `view1` |
| View 2 `vw_historico_precos` | `sql/003_views.sql` | `GET /api/bd/views/2` | `views/2` → `view2` |
| Trigger 1 `trg_veiculo_bi_padroniza` | `sql/002_triggers.sql` | `POST /api/veiculos` + `GET /api/bd/triggers/1/{placa}` | `routes/veiculos.js` POST; `triggerVeiculo` |
| Trigger 2 `trg_veiculo_au_historico` | `sql/002_triggers.sql` | `PUT /api/veiculos/{placa}` + `GET /api/bd/triggers/2` | `routes/veiculos.js` PUT; `triggerHistorico` |
| Procedure 1 `sp_reajustar_precos_tipo` | `sql/004_procedures.sql` | `POST /api/bd/procedures/1` | `procedures/1` → `procedure1` |
| Procedure 2 `sp_relatorio_proprietario` | `sql/004_procedures.sql` | `GET /api/bd/procedures/2/{cpf}` | `procedures/2/:cpf` → `procedure2` |

## Sequência sugerida para os prints
1. `POST /auth/login` e **Authorize** no Swagger.
2. Consultas 1, 2 e 3 e as Views 1 e 2 (a View 2 estará vazia: mostre antes e depois do passo 4).
3. **Trigger 1:** `POST /api/veiculos` com placa `"zzz-1a23"`, preço 50000. A resposta volta com placa `ZZZ1A23`, tipo `luxo` e datas preenchidas. Mostre também `GET /api/bd/triggers/1/ZZZ1A23`. No banco, para provar que o trigger funciona fora da API: `INSERT INTO veiculo (placa_veiculo, modelo_veiculo, preco_veiculo, cpf_proprietario, id_tipo) VALUES (' xx-9y99 ','Direto',1000,'52998224725',1);`
4. **Trigger 2:** `GET /api/bd/triggers/2` (vazio), `PUT /api/veiculos/ZZZ1A23` com preço 120000 e `GET /api/bd/triggers/2` (agora com 1 linha). Depois `GET /api/bd/views/2`.
5. **Procedure 1:** `GET /api/bd/views/1` (antes), `POST /api/bd/procedures/1` com `{"idTipo":2,"percentual":5}`, `GET /api/veiculos?tipo=luxo` e `GET /api/bd/views/2` (depois).
6. **Procedure 2:** `GET /api/bd/procedures/2/52998224725`.
7. Para o lado de Server Side: PUT/DELETE, `GET /api/veiculos?cpf=...&tipo=...` e um POST sem token (401).
