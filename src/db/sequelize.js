const { Sequelize } = require('sequelize');
const cfg = require('../config');

const sequelize = new Sequelize(cfg.db.name, cfg.db.user, cfg.db.password, {
  host: cfg.db.host,
  port: cfg.db.port,
  dialect: 'mariadb',
  logging: false,
  define: { timestamps: false, freezeTableName: true },
  dialectOptions: { dateStrings: true, typeCast: true, timezone: 'local' },
});

module.exports = sequelize;
