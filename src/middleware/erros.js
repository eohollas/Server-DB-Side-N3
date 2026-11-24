const { ZodError } = require('zod');

class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const TITULOS = { 400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 409: 'Conflict', 500: 'Internal Server Error' };

const MENSAGENS_PROCEDURE = ['Tipo de veiculo inexistente', 'Proprietario nao encontrado', 'Percentual fora do intervalo'];

function naoEncontrada(req, res) {
  res.status(404).json(corpo(404, 'Rota não encontrada', req));
}

function corpo(status, mensagem, req) {
  return { timestamp: new Date().toISOString(), status, erro: TITULOS[status] || 'Error', mensagem, caminho: req.originalUrl.split('?')[0] };
}

function tratarErros(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json(corpo(err.status, err.message, req));
  if (err instanceof ZodError) {
    const msg = err.issues.map((i) => `${i.path.join('.') || 'corpo'}: ${i.message}`).join('; ');
    return res.status(400).json(corpo(400, msg, req));
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json(corpo(400, 'JSON inválido', req));

  const original = err.original || err.parent || err;
  const textoSql = original.sqlMessage || original.message || '';
  if (original.sqlState === '45000' || MENSAGENS_PROCEDURE.some((m) => textoSql.includes(m))) {
    return res.status(400).json(corpo(400, textoSql.replace(/^\(conn[^)]*\)\s*/, '').trim(), req));
  }
  if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeForeignKeyConstraintError') {
    console.warn('Violação de integridade:', textoSql);
    return res.status(409).json(corpo(409, 'Operação viola uma restrição do banco de dados', req));
  }
  console.error(err);
  return res.status(500).json(corpo(500, 'Erro interno', req));
}

module.exports = { HttpError, tratarErros, naoEncontrada };
