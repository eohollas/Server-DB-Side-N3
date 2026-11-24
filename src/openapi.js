const fs = require('node:fs');
const path = require('node:path');
const { SQL } = require('./db/consultasBd');

const scriptViews = fs.readFileSync(path.join(__dirname, '..', 'sql', '003_views.sql'), 'utf8');
const definicaoView = (nome) => {
  const bloco = scriptViews.split(/(?=CREATE OR REPLACE VIEW)/).find((b) => b.includes(`VIEW ${nome} `));
  return bloco ? bloco.trim() : '';
};
const bloco = (titulo, sql) => `**${titulo}**\n\n\`\`\`sql\n${sql}\n\`\`\``;
const descConsulta = (pergunta, sql) => `${pergunta}\n\n${bloco('SQL executado ao clicar em Execute', sql)}`;
const descView = (pergunta, nome, sql) =>
  `${pergunta}\n\n${bloco('Comando executado ao clicar em Execute', sql)}\n\n${bloco(`Definição da view (CREATE VIEW ${nome})`, definicaoView(nome))}`;

const json = (schema) => ({ content: { 'application/json': { schema } } });
const ref = (n) => ({ $ref: `#/components/schemas/${n}` });
const seguro = [{ bearer: [] }];
const ok = (d, schema) => ({ 200: { description: d, ...(schema ? json(schema) : {}) } });
const resBd = ok('Objetivo, SQL executado e linhas', ref('ResultadoBd'));
const param = (name, where, desc, example) => ({ name, in: where, required: where === 'path', description: desc, schema: { type: 'string', example } });

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API de Proprietários e Veículos - N3',
    version: '1.0.0',
    description: 'Server Side + Banco de Dados. Autor: Pedro Gabriel Hollas - Engenharia de Software.\n\nFaça login em /auth/login, copie o token e clique em **Authorize**.',
  },
  components: {
    securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      ResultadoBd: { type: 'object', properties: { item: { type: 'string' }, objetivo: { type: 'string' }, sql: { type: 'string' }, totalLinhas: { type: 'integer' }, linhas: { type: 'array', items: { type: 'object' } } } },
      Login: { type: 'object', required: ['username', 'senha'], properties: { username: { type: 'string', example: 'admin' }, senha: { type: 'string', example: 'admin123' } } },
      Proprietario: { type: 'object', required: ['cpf', 'nome'], properties: { cpf: { type: 'string', example: '12345678909' }, nome: { type: 'string', example: 'Novo Dono' }, fone: { type: 'string', example: '(47) 90000-0000' } } },
      Veiculo: { type: 'object', required: ['placa', 'modelo', 'preco', 'cpfProprietario'], properties: { placa: { type: 'string', example: 'zzz-1a23' }, modelo: { type: 'string', example: 'Teste' }, preco: { type: 'number', example: 50000 }, cpfProprietario: { type: 'string', example: '52998224725' } } },
      VeiculoAtualizacao: { type: 'object', required: ['modelo', 'preco', 'cpfProprietario'], properties: { modelo: { type: 'string', example: 'Teste' }, preco: { type: 'number', example: 120000 }, cpfProprietario: { type: 'string', example: '52998224725' } } },
      Reajuste: { type: 'object', required: ['idTipo', 'percentual'], properties: { idTipo: { type: 'integer', example: 2, description: '1 popular, 2 luxo, 3 super luxo' }, percentual: { type: 'number', example: 5 } } },
    },
  },
  paths: {
    '/auth/login': { post: { tags: ['Autenticação'], summary: 'Login (devolve JWT)', requestBody: { required: true, ...json(ref('Login')) }, responses: { ...ok('Token'), 401: { description: 'Credenciais inválidas' } } } },
    '/api/proprietarios': {
      get: { tags: ['Proprietários'], summary: 'Listar', responses: ok('Lista') },
      post: { tags: ['Proprietários'], summary: 'Criar (JWT)', security: seguro, requestBody: { required: true, ...json(ref('Proprietario')) }, responses: { 201: { description: 'Criado' } } },
    },
    '/api/proprietarios/{cpf}': {
      get: { tags: ['Proprietários'], summary: 'Buscar', parameters: [param('cpf', 'path', 'CPF', '52998224725')], responses: ok('Proprietário') },
      put: { tags: ['Proprietários'], summary: 'Alterar (JWT)', security: seguro, parameters: [param('cpf', 'path', 'CPF', '52998224725')], requestBody: { required: true, ...json(ref('Proprietario')) }, responses: ok('Alterado') },
      delete: { tags: ['Proprietários'], summary: 'Excluir (JWT; 409 se tiver veículos)', security: seguro, parameters: [param('cpf', 'path', 'CPF', '71428793860')], responses: { 204: { description: 'Excluído' } } },
    },
    '/api/proprietarios/{cpf}/veiculos': { get: { tags: ['Proprietários'], summary: 'Veículos do proprietário (filtro opcional por tipo)', parameters: [param('cpf', 'path', 'CPF', '52998224725'), param('tipo', 'query', 'popular, luxo ou super luxo', 'luxo')], responses: ok('Lista') } },
    '/api/veiculos': {
      get: { tags: ['Veículos'], summary: 'Listar / consultar por proprietário e tipo', parameters: [param('cpf', 'query', 'CPF do proprietário', '52998224725'), param('tipo', 'query', 'popular, luxo ou super luxo', 'luxo')], responses: ok('Lista') },
      post: { tags: ['Veículos'], summary: 'Criar (JWT) - o tipo é calculado pelo preço', security: seguro, requestBody: { required: true, ...json(ref('Veiculo')) }, responses: { 201: { description: 'Criado' } } },
    },
    '/api/veiculos/{placa}': {
      get: { tags: ['Veículos'], summary: 'Buscar', parameters: [param('placa', 'path', 'Placa', 'ABC1D23')], responses: ok('Veículo') },
      put: { tags: ['Veículos'], summary: 'Alterar (JWT) - reclassifica o tipo', security: seguro, parameters: [param('placa', 'path', 'Placa', 'ZZZ1A23')], requestBody: { required: true, ...json(ref('VeiculoAtualizacao')) }, responses: ok('Alterado') },
      delete: { tags: ['Veículos'], summary: 'Excluir (JWT)', security: seguro, parameters: [param('placa', 'path', 'Placa', 'ZZZ1A23')], responses: { 204: { description: 'Excluído' } } },
    },
    '/api/bd/consultas/1': { get: { tags: ['Banco de Dados (N3)'], summary: 'Consulta 1 (3 tabelas)', description: descConsulta('Veículos acima da média de preço da própria categoria, com o dono e o percentual acima da média. Usa 3 tabelas: veiculo, proprietario e tipo_veiculo, mais uma subconsulta com a média por tipo.', SQL.SQL_CONSULTA_1), responses: resBd } },
    '/api/bd/consultas/2': { get: { tags: ['Banco de Dados (N3)'], summary: 'Consulta 2 (2 tabelas)', description: descConsulta('Distribuição da frota por categoria: quantidade, menor, maior, média e soma dos preços e a participação percentual. Usa tipo_veiculo e veiculo.', SQL.SQL_CONSULTA_2), responses: resBd } },
    '/api/bd/consultas/3': { get: { tags: ['Banco de Dados (N3)'], summary: 'Consulta 3 (2 tabelas)', description: descConsulta('Proprietários com veículos em pelo menos N categorias diferentes (frota diversificada). Usa proprietario e veiculo. O valor de minCategorias entra no ? do HAVING.', SQL.SQL_CONSULTA_3), parameters: [param('minCategorias', 'query', 'Valor que substitui o ? da consulta, em HAVING COUNT(DISTINCT v.id_tipo) >= ?  (aceita 1 a 3)', '2')], responses: resBd } },
    '/api/bd/views/1': { get: { tags: ['Banco de Dados (N3)'], summary: 'View vw_patrimonio_proprietario', description: descView('Patrimônio por proprietário: quantidade por categoria, valor total, média e veículo mais caro. Inclui quem não tem veículo.', 'vw_patrimonio_proprietario', SQL.SQL_VIEW_1), responses: resBd } },
    '/api/bd/views/2': { get: { tags: ['Banco de Dados (N3)'], summary: 'View vw_historico_precos', description: descView('Histórico de alterações de preço, com veículo, dono, variação em reais e percentual e mudança de categoria. Alimentada pelo trigger de histórico.', 'vw_historico_precos', SQL.SQL_VIEW_2), responses: resBd } },
    '/api/bd/triggers/1/{placa}': { get: { tags: ['Banco de Dados (N3)'], summary: 'Trigger 1: efeito no veículo', parameters: [param('placa', 'path', 'Placa', 'ZZZ1A23')], responses: resBd } },
    '/api/bd/triggers/2': { get: { tags: ['Banco de Dados (N3)'], summary: 'Trigger 2: histórico gravado', responses: resBd } },
    '/api/bd/procedures/1': { post: { tags: ['Banco de Dados (N3)'], summary: 'Procedure sp_reajustar_precos_tipo (JWT)', security: seguro, requestBody: { required: true, ...json(ref('Reajuste')) }, responses: resBd } },
    '/api/bd/procedures/2/{cpf}': { get: { tags: ['Banco de Dados (N3)'], summary: 'Procedure sp_relatorio_proprietario', parameters: [param('cpf', 'path', 'CPF', '52998224725')], responses: resBd } },
  },
};
