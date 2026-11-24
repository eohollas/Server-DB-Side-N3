const { Router } = require('express');
const { exigirToken } = require('../middleware/auth');
const veiculos = require('../services/veiculos');
const schemas = require('./schemas');

const router = Router();

router.get('/', async (req, res) => {
  res.json(await veiculos.listar({ cpf: req.query.cpf, tipo: req.query.tipo }));
});

router.get('/:placa', async (req, res) => res.json(veiculos.resposta(await veiculos.buscar(req.params.placa))));

router.post('/', exigirToken, async (req, res) => {
  const criado = await veiculos.criar(schemas.veiculo.parse(req.body));
  res.status(201).location(`/api/veiculos/${criado.placa}`).json(criado);
});

router.put('/:placa', exigirToken, async (req, res) => {
  res.json(await veiculos.atualizar(req.params.placa, schemas.veiculoAtualizacao.parse(req.body)));
});

router.delete('/:placa', exigirToken, async (req, res) => {
  await veiculos.excluir(req.params.placa);
  res.status(204).end();
});

module.exports = router;
