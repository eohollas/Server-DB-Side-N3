CREATE OR REPLACE VIEW vw_patrimonio_proprietario AS
SELECT
    p.cpf,
    p.nome,
    p.fone,
    COUNT(v.placa_veiculo)                                       AS qtd_veiculos,
    SUM(CASE WHEN t.tipo = 'popular'    THEN 1 ELSE 0 END)       AS qtd_popular,
    SUM(CASE WHEN t.tipo = 'luxo'       THEN 1 ELSE 0 END)       AS qtd_luxo,
    SUM(CASE WHEN t.tipo = 'super luxo' THEN 1 ELSE 0 END)       AS qtd_super_luxo,
    COALESCE(SUM(v.preco_veiculo), 0)                            AS valor_total_frota,
    COALESCE(ROUND(AVG(v.preco_veiculo), 2), 0)                  AS valor_medio,
    COALESCE(MAX(v.preco_veiculo), 0)                            AS veiculo_mais_caro
FROM proprietario p
LEFT JOIN veiculo v      ON v.cpf_proprietario = p.cpf
LEFT JOIN tipo_veiculo t ON t.id_tipo = v.id_tipo
GROUP BY p.cpf, p.nome, p.fone;

CREATE OR REPLACE VIEW vw_historico_precos AS
SELECT
    h.id_historico,
    h.data_alteracao,
    h.placa_veiculo,
    v.modelo_veiculo,
    p.nome                                                        AS proprietario,
    h.preco_anterior,
    h.preco_novo,
    (h.preco_novo - h.preco_anterior)                             AS variacao_valor,
    ROUND((h.preco_novo - h.preco_anterior) / h.preco_anterior * 100, 2) AS variacao_percentual,
    ta.tipo                                                       AS tipo_anterior,
    tn.tipo                                                       AS tipo_novo,
    CASE WHEN h.id_tipo_anterior <> h.id_tipo_novo THEN 'SIM' ELSE 'NAO' END AS mudou_categoria,
    h.usuario_banco
FROM historico_preco h
LEFT JOIN veiculo v       ON v.placa_veiculo = h.placa_veiculo
LEFT JOIN proprietario p  ON p.cpf = v.cpf_proprietario
JOIN tipo_veiculo ta      ON ta.id_tipo = h.id_tipo_anterior
JOIN tipo_veiculo tn      ON tn.id_tipo = h.id_tipo_novo;
