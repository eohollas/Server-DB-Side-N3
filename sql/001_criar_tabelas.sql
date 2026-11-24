CREATE TABLE tipo_veiculo (
    id_tipo INT          NOT NULL AUTO_INCREMENT,
    tipo    VARCHAR(30)  NOT NULL,
    CONSTRAINT pk_tipo_veiculo PRIMARY KEY (id_tipo),
    CONSTRAINT uk_tipo_veiculo_tipo UNIQUE (tipo)
) ENGINE = InnoDB;

CREATE TABLE proprietario (
    cpf  VARCHAR(11)  NOT NULL,
    nome VARCHAR(100) NOT NULL,
    fone VARCHAR(20),
    CONSTRAINT pk_proprietario PRIMARY KEY (cpf)
) ENGINE = InnoDB;

CREATE TABLE veiculo (
    placa_veiculo    VARCHAR(8)     NOT NULL,
    modelo_veiculo   VARCHAR(80)    NOT NULL,
    preco_veiculo    DECIMAL(12, 2) NOT NULL,
    cpf_proprietario VARCHAR(11)    NOT NULL,
    id_tipo          INT            NOT NULL,
    data_cadastro    DATETIME       NULL,
    data_atualizacao DATETIME       NULL,
    CONSTRAINT pk_veiculo PRIMARY KEY (placa_veiculo),
    CONSTRAINT ck_veiculo_preco CHECK (preco_veiculo > 0),
    CONSTRAINT fk_veiculo_proprietario FOREIGN KEY (cpf_proprietario)
        REFERENCES proprietario (cpf) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_veiculo_tipo FOREIGN KEY (id_tipo)
        REFERENCES tipo_veiculo (id_tipo)
) ENGINE = InnoDB;

CREATE INDEX ix_veiculo_proprietario ON veiculo (cpf_proprietario);
CREATE INDEX ix_veiculo_tipo ON veiculo (id_tipo);

CREATE TABLE historico_preco (
    id_historico     BIGINT         NOT NULL AUTO_INCREMENT,
    placa_veiculo    VARCHAR(8)     NOT NULL,
    preco_anterior   DECIMAL(12, 2) NOT NULL,
    preco_novo       DECIMAL(12, 2) NOT NULL,
    id_tipo_anterior INT            NOT NULL,
    id_tipo_novo     INT            NOT NULL,
    data_alteracao   DATETIME       NOT NULL,
    usuario_banco    VARCHAR(100)   NOT NULL,
    CONSTRAINT pk_historico_preco PRIMARY KEY (id_historico)
) ENGINE = InnoDB;

CREATE INDEX ix_historico_placa ON historico_preco (placa_veiculo);

CREATE TABLE usuario (
    id_usuario BIGINT       NOT NULL AUTO_INCREMENT,
    username   VARCHAR(50)  NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    perfil     VARCHAR(20)  NOT NULL DEFAULT 'ADMIN',
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uk_usuario_username UNIQUE (username)
) ENGINE = InnoDB;

INSERT INTO tipo_veiculo (id_tipo, tipo) VALUES
    (1, 'popular'),
    (2, 'luxo'),
    (3, 'super luxo');
