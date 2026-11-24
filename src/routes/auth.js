const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { gerarToken } = require('../middleware/auth');
const { HttpError } = require('../middleware/erros');
const cfg = require('../config');
const schemas = require('./schemas');

const router = Router();
const HASH_FALSO = bcrypt.hashSync('sem-usuario', 10);

router.post('/auth/login', async (req, res) => {
  const { username, senha } = schemas.login.parse(req.body);
  const usuario = await Usuario.findOne({ where: { username } });
  const ok = await bcrypt.compare(senha, usuario ? usuario.senhaHash : HASH_FALSO);
  if (!usuario || !ok) throw new HttpError(401, 'Usuário ou senha inválidos');
  res.json({ token: gerarToken(usuario), tipo: 'Bearer', expiraEmSegundos: cfg.jwt.expiracaoSegundos });
});

module.exports = router;
