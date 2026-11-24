const { z } = require('zod');

const cpf = z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF deve ter 11 dígitos');
const preco = z.number({ error: 'preco deve ser numérico' })
  .min(0.01, 'preco deve ser maior que zero')
  .max(9999999999.99, 'preco muito alto')
  .refine((n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6, 'preco aceita no máximo 2 casas decimais');

module.exports = {
  login: z.object({ username: z.string().min(1), senha: z.string().min(1) }),
  proprietario: z.object({
    cpf,
    nome: z.string().trim().min(1).max(100),
    fone: z.string().max(20).regex(/^$|^[0-9()+\- ]{8,20}$/, 'telefone inválido').optional().nullable(),
  }),
  veiculo: z.object({
    placa: z.string().regex(/^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$/, 'placa deve seguir o padrão AAA9999 ou Mercosul AAA9A99'),
    modelo: z.string().trim().min(1).max(80),
    preco,
    cpfProprietario: cpf,
  }),
  veiculoAtualizacao: z.object({ modelo: z.string().trim().min(1).max(80), preco, cpfProprietario: cpf }),
  reajuste: z.object({
    idTipo: z.number().int().min(1).max(3),
    percentual: z.number().min(-99.99).max(1000)
      .refine((n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6, 'percentual aceita no máximo 2 casas decimais'),
  }),
};
