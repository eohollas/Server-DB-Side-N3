const { QueryTypes } = require('sequelize');
const sequelize = require('./sequelize');

const SQL_CONSULTA_1 = `
SELECT v.placa_veiculo,
       v.modelo_veiculo,
       t.tipo,
       p.nome AS proprietario,
       p.fone,
       v.preco_veiculo,
       m.media_tipo,
       ROUND((v.preco_veiculo - m.media_tipo) / m.media_tipo * 100, 2) AS pct_acima_media
FROM veiculo v
INNER JOIN proprietario p ON p.cpf = v.cpf_proprietario
INNER JOIN tipo_veiculo t ON t.id_tipo = v.id_tipo
INNER JOIN (SELECT id_tipo, ROUND(AVG(preco_veiculo), 2) AS media_tipo
      FROM veiculo
      GROUP BY id_tipo) m ON m.id_tipo = v.id_tipo
WHERE v.preco_veiculo > m.media_tipo
ORDER BY t.id_tipo, pct_acima_media DESC`.trim();

const SQL_CONSULTA_2 = `
SELECT t.id_tipo,
       t.tipo,
       COUNT(v.placa_veiculo)                      AS qtd_veiculos,
       COALESCE(MIN(v.preco_veiculo), 0)           AS menor_preco,
       COALESCE(MAX(v.preco_veiculo), 0)           AS maior_preco,
       COALESCE(ROUND(AVG(v.preco_veiculo), 2), 0) AS preco_medio,
       COALESCE(SUM(v.preco_veiculo), 0)           AS valor_total,
       ROUND(COUNT(v.placa_veiculo) * 100.0
             / NULLIF((SELECT COUNT(*) FROM veiculo), 0), 2) AS pct_da_frota
FROM tipo_veiculo t
INNER JOIN veiculo v ON v.id_tipo = t.id_tipo
GROUP BY t.id_tipo, t.tipo
ORDER BY t.id_tipo`.trim();

const SQL_CONSULTA_3 = `
SELECT v.placa_veiculo,
       v.modelo_veiculo,
       v.preco_veiculo,
       p.nome AS proprietario,
       p.fone,
       v.data_cadastro
FROM veiculo v
INNER JOIN proprietario p ON p.cpf = v.cpf_proprietario
WHERE v.preco_veiculo >= ?
ORDER BY v.preco_veiculo DESC`.trim();

const SQL_VIEW_1 = 'SELECT * FROM vw_patrimonio_proprietario ORDER BY valor_total_frota DESC';
const SQL_VIEW_2 = 'SELECT * FROM vw_historico_precos ORDER BY id_historico DESC';
const SQL_TRIGGER_HISTORICO = 'SELECT * FROM historico_preco ORDER BY id_historico DESC';
const SQL_TRIGGER_VEICULO = `
SELECT placa_veiculo, modelo_veiculo, preco_veiculo, id_tipo, data_cadastro, data_atualizacao
FROM veiculo WHERE placa_veiculo = ?`.trim();
const SQL_PROCEDURE_1 = 'CALL sp_reajustar_precos_tipo(?, ?, @afetados)';
const SQL_PROCEDURE_2 = 'CALL sp_relatorio_proprietario(?)';

const ler = (sql, replacements = []) =>
  sequelize.query(sql, { type: QueryTypes.SELECT, replacements });

function linhasDoCall(resultado) {
  if (!Array.isArray(resultado)) return [];
  return resultado.filter((l) => l && typeof l === 'object' && !('affectedRows' in l && 'warningStatus' in l));
}

module.exports = {
  SQL: { SQL_CONSULTA_1, SQL_CONSULTA_2, SQL_CONSULTA_3, SQL_VIEW_1, SQL_VIEW_2,
         SQL_TRIGGER_HISTORICO, SQL_TRIGGER_VEICULO, SQL_PROCEDURE_1, SQL_PROCEDURE_2 },

  consulta1: () => ler(SQL_CONSULTA_1),
  consulta2: () => ler(SQL_CONSULTA_2),
  consulta3: (precoMinimo) => ler(SQL_CONSULTA_3, [precoMinimo]),
  view1: () => ler(SQL_VIEW_1),
  view2: () => ler(SQL_VIEW_2),
  triggerHistorico: () => ler(SQL_TRIGGER_HISTORICO),
  triggerVeiculo: (placa) => ler(SQL_TRIGGER_VEICULO, [placa]),

  async procedure1(idTipo, percentual) {
    return sequelize.transaction(async (transaction) => {
      await sequelize.query(SQL_PROCEDURE_1, { replacements: [idTipo, percentual], transaction });
      const [linha] = await sequelize.query('SELECT @afetados AS afetados', { type: QueryTypes.SELECT, transaction });
      return Number(linha.afetados);
    });
  },

  async procedure2(cpf) {
    const resultado = await sequelize.query(SQL_PROCEDURE_2, { replacements: [cpf] });
    const bruto = Array.isArray(resultado[0]) ? resultado[0] : resultado;
    return linhasDoCall(bruto);
  },
};
