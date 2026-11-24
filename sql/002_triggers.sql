DELIMITER $$
CREATE TRIGGER trg_veiculo_bi_padroniza
BEFORE INSERT ON veiculo
FOR EACH ROW
BEGIN
    SET NEW.placa_veiculo    = UPPER(REPLACE(REPLACE(TRIM(NEW.placa_veiculo), '-', ''), ' ', ''));
    SET NEW.data_cadastro    = NOW();
    SET NEW.data_atualizacao = NOW();
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_veiculo_au_historico
AFTER UPDATE ON veiculo
FOR EACH ROW
BEGIN
    IF OLD.preco_veiculo <> NEW.preco_veiculo OR OLD.id_tipo <> NEW.id_tipo THEN
        INSERT INTO historico_preco
            (placa_veiculo, preco_anterior, preco_novo,
             id_tipo_anterior, id_tipo_novo, data_alteracao, usuario_banco)
        VALUES
            (NEW.placa_veiculo, OLD.preco_veiculo, NEW.preco_veiculo,
             OLD.id_tipo, NEW.id_tipo, NOW(), CURRENT_USER());
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_veiculo_bu_data
BEFORE UPDATE ON veiculo
FOR EACH ROW
BEGIN
    SET NEW.data_atualizacao = NOW();
    SET NEW.data_cadastro    = OLD.data_cadastro;
END$$
DELIMITER ;
