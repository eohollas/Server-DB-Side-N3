const { Router } = require('express');
const { exigirToken } = require('../middleware/auth');
const proprietarios = require('../services/proprietarios');
const veiculos = require('../services/veiculos');
const schemas = require('./schemas');

const router = Router();

router.get('/', async (req, res) => res.json(await proprietarios.listar()));

router.get('/:cpf', async (req, res) => {
  res.json(await proprietarios.resposta(await proprietarios.buscar(req.params.cpf)));
});

router.get('/:cpf/veiculos', async (req, res) => {
  res.json(await veiculos.listar({ cpf: req.params.cpf, tipo: req.query.tipo }));
});

router.post('/', exigirToken, async (req, res) => {
  const criado = await proprietarios.criar(schemas.proprietario.parse(req.body));
  res.status(201).location(`/api/proprietarios/${criado.cpf}`).json(criado);
});

router.put('/:cpf', exigirToken, async (req, res) => {
  res.json(await proprietarios.atualizar(req.params.cpf, schemas.proprietario.parse(req.body)));
});

router.delete('/:cpf', exigirToken, async (req, res) => {
  await proprietarios.excluir(req.params.cpf);
  res.status(204).end();
});

module.exports = router;
