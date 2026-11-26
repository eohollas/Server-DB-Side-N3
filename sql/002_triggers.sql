-- Triggers no padrao da Aula 07:
-- create trigger nome tempo evento on tabela for each row begin ... end
-- new.coluna / old.coluna; signal sqlstate '45000' para barrar a operacao.

delimiter $$

-- 1) BEFORE INSERT: padroniza a placa e carimba as datas
create or replace trigger trg_veiculo_bi_padroniza
before insert on veiculo
for each row
begin
    set new.placa_veiculo    = upper(replace(replace(trim(new.placa_veiculo), '-', ''), ' ', ''));
    set new.data_cadastro    = now();
    set new.data_atualizacao = now();
end $$

-- 2) AFTER UPDATE: grava o historico quando preco ou tipo mudam
create or replace trigger trg_veiculo_au_historico
after update on veiculo
for each row
begin
    if (old.preco_veiculo <> new.preco_veiculo) or (old.id_tipo <> new.id_tipo) then
        insert into historico_preco
            (placa_veiculo, preco_anterior, preco_novo,
             id_tipo_anterior, id_tipo_novo, data_alteracao, usuario_banco)
        values
            (new.placa_veiculo, old.preco_veiculo, new.preco_veiculo,
             old.id_tipo, new.id_tipo, now(), current_user());
    end if;
end $$

-- 3) BEFORE UPDATE: atualiza data_atualizacao e protege data_cadastro
create or replace trigger trg_veiculo_bu_data
before update on veiculo
for each row
begin
    set new.data_atualizacao = now();
    set new.data_cadastro    = old.data_cadastro;
end $$

delimiter ;
