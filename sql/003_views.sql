-- Views: todos os joins sao INNER JOIN.
-- Atencao: proprietario sem veiculo nao aparece em vw_patrimonio_proprietario.

create or replace view vw_patrimonio_proprietario as
select
    p.cpf,
    p.nome,
    p.fone,
    count(v.placa_veiculo)                                  as qtd_veiculos,
    sum(case when t.tipo = 'popular'    then 1 else 0 end)  as qtd_popular,
    sum(case when t.tipo = 'luxo'       then 1 else 0 end)  as qtd_luxo,
    sum(case when t.tipo = 'super luxo' then 1 else 0 end)  as qtd_super_luxo,
    sum(v.preco_veiculo)                                    as valor_total_frota,
    round(avg(v.preco_veiculo), 2)                          as valor_medio,
    max(v.preco_veiculo)                                    as veiculo_mais_caro
from proprietario p
inner join veiculo v      on v.cpf_proprietario = p.cpf
inner join tipo_veiculo t on t.id_tipo = v.id_tipo
group by p.cpf, p.nome, p.fone;

-- Atencao: historico de veiculo que foi excluido nao aparece mais nesta view.
create or replace view vw_historico_precos as
select
    h.id_historico,
    h.data_alteracao,
    h.placa_veiculo,
    v.modelo_veiculo,
    p.nome                                                               as proprietario,
    h.preco_anterior,
    h.preco_novo,
    (h.preco_novo - h.preco_anterior)                                    as variacao_valor,
    round((h.preco_novo - h.preco_anterior) / h.preco_anterior * 100, 2) as variacao_percentual,
    ta.tipo                                                              as tipo_anterior,
    tn.tipo                                                              as tipo_novo,
    case when h.id_tipo_anterior <> h.id_tipo_novo then 'SIM' else 'NAO' end as mudou_categoria,
    h.usuario_banco
from historico_preco h
inner join veiculo v       on v.placa_veiculo = h.placa_veiculo
inner join proprietario p  on p.cpf = v.cpf_proprietario
inner join tipo_veiculo ta on ta.id_tipo = h.id_tipo_anterior
inner join tipo_veiculo tn on tn.id_tipo = h.id_tipo_novo;
