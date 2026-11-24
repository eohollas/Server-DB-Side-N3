const bcrypt = require('bcryptjs');
const cfg = require('./config');
const sequelize = require('./db/sequelize');
const { migrar } = require('./db/migrar');
const { Usuario } = require('./models');
const app = require('./app');

async function criarAdmin() {
  const existe = await Usuario.findOne({ where: { username: cfg.admin.username } });
  if (!existe) {
    await Usuario.create({ username: cfg.admin.username, senhaHash: await bcrypt.hash(cfg.admin.senha, 10) });
    console.log(`Usuário '${cfg.admin.username}' criado.`);
  }
}

async function iniciar() {
  await sequelize.authenticate();
  await migrar();
  await criarAdmin();
  app.listen(cfg.port, () => {
    console.log(`API no ar: http://localhost:${cfg.port}  |  Swagger: http://localhost:${cfg.port}/swagger-ui`);
  });
}

iniciar().catch((e) => {
  console.error('Falha ao iniciar:', e.message);
  process.exit(1);
});
