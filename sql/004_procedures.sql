DELIMITER $$
CREATE PROCEDURE sp_reajustar_precos_tipo(
    IN  p_id_tipo    INT,
    IN  p_percentual DECIMAL(6, 2),
    OUT p_afetados   INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF NOT EXISTS (SELECT 1 FROM tipo_veiculo WHERE id_tipo = p_id_tipo) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de veiculo inexistente';
    END IF;

    IF p_percentual <= -100 OR p_percentual > 1000 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Percentual fora do intervalo permitido (-100, 1000]';
    END IF;

    START TRANSACTION;

    DROP TEMPORARY TABLE IF EXISTS tmp_reajuste;
    CREATE TEMPORARY TABLE tmp_reajuste AS
        SELECT placa_veiculo,
               ROUND(preco_veiculo * (1 + p_percentual / 100), 2) AS novo_preco
        FROM veiculo
        WHERE id_tipo = p_id_tipo;

    UPDATE veiculo v
    JOIN tmp_reajuste r ON r.placa_veiculo = v.placa_veiculo
    SET v.preco_veiculo = r.novo_preco,
        v.id_tipo = CASE
            WHEN r.novo_preco < 50000  THEN 1
            WHEN r.novo_preco < 100000 THEN 2
            ELSE 3
        END;

    SET p_afetados = ROW_COUNT();

    DROP TEMPORARY TABLE IF EXISTS tmp_reajuste;
    COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_relatorio_proprietario(IN p_cpf VARCHAR(11))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM proprietario WHERE cpf = p_cpf) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Proprietario nao encontrado';
    END IF;

    WITH media_tipo AS (
        SELECT id_tipo, ROUND(AVG(preco_veiculo), 2) AS media_categoria
        FROM veiculo
        GROUP BY id_tipo
    )
    SELECT
        p.cpf,
        p.nome,
        v.placa_veiculo,
        v.modelo_veiculo,
        t.tipo,
        v.preco_veiculo,
        RANK() OVER (ORDER BY v.preco_veiculo DESC)                       AS ranking_no_patrimonio,
        ROUND(v.preco_veiculo / SUM(v.preco_veiculo) OVER () * 100, 2)    AS pct_do_patrimonio,
        SUM(v.preco_veiculo) OVER ()                                      AS patrimonio_total,
        m.media_categoria,
        ROUND(v.preco_veiculo - m.media_categoria, 2)                     AS diferenca_media_categoria
    FROM proprietario p
    JOIN veiculo v      ON v.cpf_proprietario = p.cpf
    JOIN tipo_veiculo t ON t.id_tipo = v.id_tipo
    JOIN media_tipo m   ON m.id_tipo = v.id_tipo
    WHERE p.cpf = p_cpf
    ORDER BY ranking_no_patrimonio;
END$$
DELIMITER ;
