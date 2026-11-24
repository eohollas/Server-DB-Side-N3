module.exports = {
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'n3_veiculos',
    user: process.env.DB_USER ?? 'n3',
    password: process.env.DB_PASSWORD ?? 'n3senha',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'troque-este-segredo-de-teste-n3-pedro-2026',
    expiracaoSegundos: Number(process.env.JWT_EXPIRACAO || 3600),
  },
  admin: {
    username: process.env.ADMIN_USER || 'admin',
    senha: process.env.ADMIN_PASSWORD || 'admin123',
  },
};
