const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { tratarErros, naoEncontrada } = require('./middleware/erros');
const openapi = require('./openapi');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => res.type('html').send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<title>API Veículos N3</title><body style="font-family:system-ui;max-width:720px;margin:3rem auto;padding:0 1rem">
<h1>API de Proprietários e Veículos (N3)</h1>
<p>Server Side + Banco de Dados - Pedro Gabriel Hollas e João Pedro Cardozo, Engenharia de Software.</p>
<ul><li><a href="/swagger-ui">Swagger UI</a></li><li><a href="/api/veiculos">/api/veiculos</a></li>
<li><a href="/api/proprietarios">/api/proprietarios</a></li><li><a href="/api/bd/views/1">/api/bd/views/1</a></li></ul></body></html>`));

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'API Veículos N3' }));
app.get('/v3/api-docs', (req, res) => res.json(openapi));

app.use(require('./routes/auth'));
app.use('/api/proprietarios', require('./routes/proprietarios'));
app.use('/api/veiculos', require('./routes/veiculos'));
app.use('/api/bd', require('./routes/bd'));

app.use(naoEncontrada);
app.use(tratarErros);

module.exports = app;
