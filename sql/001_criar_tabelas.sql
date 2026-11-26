-- N3: proprietarios e veiculos (estilo das aulas: create table / primary key / foreign key ... references)

create table tipo_veiculo (
    id_tipo int not null auto_increment,
    tipo    varchar(30) not null,
    primary key (id_tipo),
    unique (tipo)
) engine = InnoDB;

create table proprietario (
    cpf  varchar(11)  not null,
    nome varchar(100) not null,
    fone varchar(20),
    primary key (cpf)
) engine = InnoDB;

create table veiculo (
    placa_veiculo    varchar(8)     not null,
    modelo_veiculo   varchar(80)    not null,
    preco_veiculo    decimal(12, 2) not null,
    cpf_proprietario varchar(11)    not null,
    id_tipo          int            not null,
    data_cadastro    datetime       null,
    data_atualizacao datetime       null,
    primary key (placa_veiculo),
    check (preco_veiculo > 0),
    foreign key (cpf_proprietario) references proprietario (cpf)
        on update cascade on delete restrict,
    foreign key (id_tipo) references tipo_veiculo (id_tipo)
) engine = InnoDB;

create index ix_veiculo_proprietario on veiculo (cpf_proprietario);
create index ix_veiculo_tipo on veiculo (id_tipo);

create table historico_preco (
    id_historico     bigint         not null auto_increment,
    placa_veiculo    varchar(8)     not null,
    preco_anterior   decimal(12, 2) not null,
    preco_novo       decimal(12, 2) not null,
    id_tipo_anterior int            not null,
    id_tipo_novo     int            not null,
    data_alteracao   datetime       not null,
    usuario_banco    varchar(100)   not null,
    primary key (id_historico)
) engine = InnoDB;

create index ix_historico_placa on historico_preco (placa_veiculo);

create table usuario (
    id_usuario bigint       not null auto_increment,
    username   varchar(50)  not null,
    senha_hash varchar(100) not null,
    perfil     varchar(20)  not null default 'ADMIN',
    primary key (id_usuario),
    unique (username)
) engine = InnoDB;

insert into tipo_veiculo (id_tipo, tipo) values
    (1, 'popular'),
    (2, 'luxo'),
    (3, 'super luxo');
