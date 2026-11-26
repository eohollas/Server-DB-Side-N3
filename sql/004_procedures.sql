-- Stored procedures no padrao da Aula 08:
-- delimiter ...; create procedure nome (parametros) begin ... end; call nome(args);
-- Todos os joins sao INNER JOIN.

delimiter $$

-- 1) Procedure com parametros (IN/OUT) que faz UPDATE: reajusta o preco de um tipo
create or replace procedure sp_reajustar_precos_tipo (
    in  p_id_tipo    int,
    in  p_percentual decimal(6, 2),
    out p_afetados   int
)
begin
    declare exit handler for sqlexception
    begin
        rollback;
        resignal;
    end;

    if not exists (select 1 from tipo_veiculo where id_tipo = p_id_tipo) then
        signal sqlstate '45000' set message_text = 'Tipo de veiculo inexistente';
    end if;

    if p_percentual <= -100 or p_percentual > 1000 then
        signal sqlstate '45000' set message_text = 'Percentual fora do intervalo permitido (-100, 1000]';
    end if;

    start transaction;

    drop temporary table if exists tmp_reajuste;
    create temporary table tmp_reajuste as
        select placa_veiculo,
               round(preco_veiculo * (1 + p_percentual / 100), 2) as novo_preco
        from veiculo
        where id_tipo = p_id_tipo;

    update veiculo v
    inner join tmp_reajuste r on r.placa_veiculo = v.placa_veiculo
    set v.preco_veiculo = r.novo_preco,
        v.id_tipo = case
            when r.novo_preco < 50000  then 1
            when r.novo_preco < 100000 then 2
            else 3
        end;

    set p_afetados = row_count();

    drop temporary table if exists tmp_reajuste;
    commit;
end $$

-- 2) Procedure de consulta complexa reutilizavel: relatorio de um proprietario
create or replace procedure sp_relatorio_proprietario (in p_cpf varchar(11))
begin
    if not exists (select 1 from proprietario where cpf = p_cpf) then
        signal sqlstate '45000' set message_text = 'Proprietario nao encontrado';
    end if;

    with media_tipo as (
        select id_tipo, round(avg(preco_veiculo), 2) as media_categoria
        from veiculo
        group by id_tipo
    )
    select
        p.cpf,
        p.nome,
        v.placa_veiculo,
        v.modelo_veiculo,
        t.tipo,
        v.preco_veiculo,
        rank() over (order by v.preco_veiculo desc)                     as ranking_no_patrimonio,
        round(v.preco_veiculo / sum(v.preco_veiculo) over () * 100, 2)  as pct_do_patrimonio,
        sum(v.preco_veiculo) over ()                                    as patrimonio_total,
        m.media_categoria,
        round(v.preco_veiculo - m.media_categoria, 2)                   as diferenca_media_categoria
    from proprietario p
    inner join veiculo v      on v.cpf_proprietario = p.cpf
    inner join tipo_veiculo t on t.id_tipo = v.id_tipo
    inner join media_tipo m   on m.id_tipo = v.id_tipo
    where p.cpf = p_cpf
    order by ranking_no_patrimonio;
end $$

delimiter ;
