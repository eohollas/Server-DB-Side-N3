const { Veiculo, TipoVeiculo, Proprietario } = require('../models');
const { HttpError } = require('../middleware/erros');
const { classificar } = require('./classificacao');
const proprietarios = require('./proprietarios');

const normalizarPlaca = (placa) => String(placa ?? '').replace(/[-\s]/g, '').toUpperCase();

const CAMPOS_ESCRITA = ['placa', 'modelo', 'preco', 'cpfProprietario', 'idTipo'];
const INCLUIR = [
  { model: TipoVeiculo, as: 'tipo' },
  { model: Proprietario, as: 'proprietario' },
];

function resposta(v) {
  return {
    placa: v.placa,
    modelo: v.modelo,
    preco: Number(v.preco),
    idTipo: v.tipo.idTipo,
    tipo: v.tipo.tipo,
    cpfProprietario: v.proprietario.cpf,
    nomeProprietario: v.proprietario.nome,
    dataCadastro: v.dataCadastro,
    dataAtualizacao: v.dataAtualizacao,
  };
}

async function idTipoPara(preco) {
  const nome = classificar(preco);
  const tipo = await TipoVeiculo.findOne({ where: { tipo: nome } });
  if (!tipo) throw new Error(`Tipo não cadastrado: ${nome}`);
  return tipo.idTipo;
}

async function carregar(placa) {
  return Veiculo.findByPk(placa, { include: INCLUIR });
}

async function buscar(placa) {
  const v = await carregar(normalizarPlaca(placa));
  if (!v) throw new HttpError(404, `Veículo não encontrado: ${placa}`);
  return v;
}

async function tipoValido(tipo) {
  const t = await TipoVeiculo.findOne({ where: { tipo: String(tipo).toLowerCase() } });
  if (!t) throw new HttpError(400, 'Tipo inválido. Use: popular, luxo ou super luxo');
  return t;
}

async function listar({ cpf, tipo } = {}) {
  const where = {};
  if (cpf) {
    const dono = await proprietarios.buscar(cpf);
    where.cpfProprietario = dono.cpf;
  }
  if (tipo) where.idTipo = (await tipoValido(tipo)).idTipo;
  const lista = await Veiculo.findAll({
    where, include: INCLUIR,
    order: tipo && !cpf ? [['preco', 'DESC']] : [['placa', 'ASC']],
  });
  return lista.map(resposta);
}

async function criar({ placa, modelo, preco, cpfProprietario }) {
  const id = normalizarPlaca(placa);
  if (await Veiculo.findByPk(id)) throw new HttpError(409, `Já existe veículo com a placa ${id}`);
  const dono = await proprietarios.buscar(cpfProprietario);
  await Veiculo.create(
    { placa: id, modelo: modelo.trim(), preco, cpfProprietario: dono.cpf, idTipo: await idTipoPara(preco) },
    { fields: CAMPOS_ESCRITA },
  );
  return resposta(await carregar(id));
}

async function atualizar(placa, { modelo, preco, cpfProprietario }) {
  const v = await buscar(placa);
  const dono = await proprietarios.buscar(cpfProprietario);
  await Veiculo.update(
    { modelo: modelo.trim(), preco, cpfProprietario: dono.cpf, idTipo: await idTipoPara(preco) },
    { where: { placa: v.placa }, fields: ['modelo', 'preco', 'cpfProprietario', 'idTipo'] },
  );
  return resposta(await carregar(v.placa));
}

async function excluir(placa) {
  const v = await buscar(placa);
  await Veiculo.destroy({ where: { placa: v.placa } });
}

module.exports = { normalizarPlaca, listar, buscar, criar, atualizar, excluir, resposta };
