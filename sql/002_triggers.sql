delimiter $$

create or replace trigger trg_veiculo_bi_padroniza
before insert on veiculo
for each row
begin
    set new.placa_veiculo    = upper(replace(replace(trim(new.placa_veiculo), '-', ''), ' ', ''));
    set new.data_cadastro    = now();
    set new.data_atualizacao = now();
end $$

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

create or replace trigger trg_veiculo_bu_data
before update on veiculo
for each row
begin
    set new.data_atualizacao = now();
    set new.data_cadastro    = old.data_cadastro;
end $$

delimiter ;
