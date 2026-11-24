const { Proprietario, Veiculo } = require('../models');
const { HttpError } = require('../middleware/erros');

const normalizarCpf = (cpf) => String(cpf ?? '').replace(/\D/g, '');

async function buscar(cpf) {
  const p = await Proprietario.findByPk(normalizarCpf(cpf));
  if (!p) throw new HttpError(404, `Proprietário não encontrado: ${cpf}`);
  return p;
}

async function resposta(p) {
  const qtd = await Veiculo.count({ where: { cpfProprietario: p.cpf } });
  return { cpf: p.cpf, nome: p.nome, fone: p.fone, qtdVeiculos: qtd };
}

async function listar() {
  const todos = await Proprietario.findAll({ order: [['nome', 'ASC']] });
  return Promise.all(todos.map(resposta));
}

async function criar({ cpf, nome, fone }) {
  const id = normalizarCpf(cpf);
  if (await Proprietario.findByPk(id)) throw new HttpError(409, `Já existe proprietário com o CPF ${id}`);
  return resposta(await Proprietario.create({ cpf: id, nome: nome.trim(), fone: fone || null }));
}

async function atualizar(cpf, { nome, fone }) {
  const p = await buscar(cpf);
  await p.update({ nome: nome.trim(), fone: fone || null });
  return resposta(p);
}

async function excluir(cpf) {
  const p = await buscar(cpf);
  if (await Veiculo.count({ where: { cpfProprietario: p.cpf } })) {
    throw new HttpError(409, 'Proprietário possui veículos; exclua os veículos antes');
  }
  await p.destroy();
}

module.exports = { normalizarCpf, buscar, resposta, listar, criar, atualizar, excluir };
