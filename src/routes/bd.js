const { Router } = require('express');
const { exigirToken } = require('../middleware/auth');
const { HttpError } = require('../middleware/erros');
const bd = require('../db/consultasBd');
const { normalizarCpf } = require('../services/proprietarios');
const { normalizarPlaca } = require('../services/veiculos');
const schemas = require('./schemas');

const { SQL } = bd;
const router = Router();

const resultado = (item, objetivo, sql, linhas) => ({ item, objetivo, sql, totalLinhas: linhas.length, linhas });

router.get('/consultas/1', async (req, res) => res.json(resultado('Consulta 1 (3 tabelas)',
  'Veículos acima da média de preço da própria categoria, com dono e percentual acima da média.',
  SQL.SQL_CONSULTA_1, await bd.consulta1())));

router.get('/consultas/2', async (req, res) => res.json(resultado('Consulta 2 (2 tabelas)',
  'Distribuição da frota por categoria: quantidade, menor/maior/média/soma de preço e participação.',
  SQL.SQL_CONSULTA_2, await bd.consulta2())));

router.get('/consultas/3', async (req, res) => {
  const min = Number(req.query.minCategorias ?? 2);
  if (!Number.isInteger(min) || min < 1 || min > 3) throw new HttpError(400, 'minCategorias deve estar entre 1 e 3');
  res.json(resultado('Consulta 3 (2 tabelas)',
    `Proprietários com veículos em pelo menos ${min} categorias diferentes.`,
    SQL.SQL_CONSULTA_3, await bd.consulta3(min)));
});

router.get('/views/1', async (req, res) => res.json(resultado('View 1 - vw_patrimonio_proprietario',
  'Patrimônio por proprietário: quantidade por categoria, valor total, média e veículo mais caro.',
  SQL.SQL_VIEW_1, await bd.view1())));

router.get('/views/2', async (req, res) => res.json(resultado('View 2 - vw_historico_precos',
  'Auditoria de alterações de preço com veículo, dono, variação e mudança de categoria.',
  SQL.SQL_VIEW_2, await bd.view2())));

router.get('/triggers/1/:placa', async (req, res) => res.json(resultado('Trigger 1 - trg_veiculo_bi_padroniza',
  'Placa padronizada e datas de cadastro/atualização preenchidas pelo banco.',
  SQL.SQL_TRIGGER_VEICULO, await bd.triggerVeiculo(normalizarPlaca(req.params.placa)))));

router.get('/triggers/2', async (req, res) => res.json(resultado('Trigger 2 - trg_veiculo_au_historico',
  'Linhas gravadas automaticamente em historico_preco quando preço ou tipo de um veículo muda.',
  SQL.SQL_TRIGGER_HISTORICO, await bd.triggerHistorico())));

router.post('/procedures/1', exigirToken, async (req, res) => {
  const { idTipo, percentual } = schemas.reajuste.parse(req.body);
  const afetados = await bd.procedure1(idTipo, percentual);
  res.json(resultado('Procedure 1 - sp_reajustar_precos_tipo',
    'Reajusta o preço de todos os veículos de uma categoria e reclassifica cada um (dispara o trigger de histórico).',
    SQL.SQL_PROCEDURE_1, [{ id_tipo: idTipo, percentual, veiculos_afetados: afetados }]));
});

router.get('/procedures/2/:cpf', async (req, res) => res.json(resultado('Procedure 2 - sp_relatorio_proprietario',
  'Relatório da frota do proprietário com ranking, participação no patrimônio e comparação com a média da categoria.',
  SQL.SQL_PROCEDURE_2, await bd.procedure2(normalizarCpf(req.params.cpf)))));

module.exports = router;
