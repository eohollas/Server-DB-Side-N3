const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const TipoVeiculo = sequelize.define('TipoVeiculo', {
  idTipo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id_tipo' },
  tipo: { type: DataTypes.STRING(30), allowNull: false, unique: true },
}, { tableName: 'tipo_veiculo' });

const Proprietario = sequelize.define('Proprietario', {
  cpf: { type: DataTypes.STRING(11), primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  fone: { type: DataTypes.STRING(20) },
}, { tableName: 'proprietario' });

const Veiculo = sequelize.define('Veiculo', {
  placa: { type: DataTypes.STRING(8), primaryKey: true, field: 'placa_veiculo' },
  modelo: { type: DataTypes.STRING(80), allowNull: false, field: 'modelo_veiculo' },
  preco: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'preco_veiculo' },
  cpfProprietario: { type: DataTypes.STRING(11), allowNull: false, field: 'cpf_proprietario' },
  idTipo: { type: DataTypes.INTEGER, allowNull: false, field: 'id_tipo' },
  dataCadastro: { type: DataTypes.STRING, field: 'data_cadastro' },
  dataAtualizacao: { type: DataTypes.STRING, field: 'data_atualizacao' },
}, { tableName: 'veiculo' });

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: 'id_usuario' },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  senhaHash: { type: DataTypes.STRING(100), allowNull: false, field: 'senha_hash' },
  perfil: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ADMIN' },
}, { tableName: 'usuario' });

Proprietario.hasMany(Veiculo, { foreignKey: 'cpfProprietario', as: 'veiculos' });
Veiculo.belongsTo(Proprietario, { foreignKey: 'cpfProprietario', as: 'proprietario' });
TipoVeiculo.hasMany(Veiculo, { foreignKey: 'idTipo', as: 'veiculos' });
Veiculo.belongsTo(TipoVeiculo, { foreignKey: 'idTipo', as: 'tipo' });

module.exports = { sequelize, TipoVeiculo, Proprietario, Veiculo, Usuario };
