const jwt = require('jsonwebtoken');
const cfg = require('../config');
const { HttpError } = require('./erros');

function gerarToken(usuario) {
  return jwt.sign({ perfil: usuario.perfil }, cfg.jwt.secret, {
    subject: usuario.username,
    expiresIn: cfg.jwt.expiracaoSegundos,
    algorithm: 'HS256',
  });
}

function recusar(req, next, motivo) {
  console.warn(`401 em ${req.method} ${req.originalUrl}: ${motivo}`);
  return next(new HttpError(401, `${motivo}. Faça login em POST /auth/login e use o token no Authorize.`));
}

function extrairToken(header) {
  let valor = header.trim();
  while (/^Bearer\s+/i.test(valor)) valor = valor.replace(/^Bearer\s+/i, '');
  return valor.replace(/^["']|["']$/g, '').trim();
}

function exigirToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return recusar(req, next, 'Token ausente (cabeçalho Authorization não enviado)');
  const token = extrairToken(header);
  if (!token) return recusar(req, next, 'Token vazio');
  try {
    const dados = jwt.verify(token, cfg.jwt.secret, { algorithms: ['HS256'] });
    req.usuario = { username: dados.sub, perfil: dados.perfil };
    return next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') return recusar(req, next, 'Token expirado');
    return recusar(req, next, 'Token inválido (confira se copiou o token inteiro, sem aspas)');
  }
}

module.exports = { gerarToken, exigirToken };
