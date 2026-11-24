const fs = require('node:fs');
const path = require('node:path');
const sequelize = require('./sequelize');

const PASTA_SQL = path.join(__dirname, '..', '..', 'sql');

function dividirComandos(script) {
  const comandos = [];
  let delimitador = ';';
  let atual = [];
  for (const linha of script.split(/\r?\n/)) {
    const m = linha.match(/^\s*DELIMITER\s+(\S+)\s*$/i);
    if (m) { delimitador = m[1]; continue; }
    if (/^\s*--/.test(linha)) continue;
    if (!linha.trim() && atual.length === 0) continue;
    atual.push(linha);
    const texto = atual.join('\n').trimEnd();
    if (texto.endsWith(delimitador)) {
      const cmd = texto.slice(0, -delimitador.length).trim();
      if (cmd) comandos.push(cmd);
      atual = [];
    }
  }
  const resto = atual.join('\n').trim();
  if (resto) comandos.push(resto);
  return comandos;
}

async function migrar() {
  await sequelize.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    arquivo VARCHAR(100) NOT NULL PRIMARY KEY,
    aplicada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE = InnoDB`);
  const [feitas] = await sequelize.query('SELECT arquivo FROM schema_migrations');
  const aplicadas = new Set(feitas.map((r) => r.arquivo));

  const arquivos = fs.readdirSync(PASTA_SQL).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();
  for (const arquivo of arquivos) {
    if (aplicadas.has(arquivo)) continue;
    const comandos = dividirComandos(fs.readFileSync(path.join(PASTA_SQL, arquivo), 'utf8'));
    for (const cmd of comandos) {
      await sequelize.query(cmd);
    }
    await sequelize.query('INSERT INTO schema_migrations (arquivo) VALUES (?)', { replacements: [arquivo] });
    console.log(`Migration aplicada: ${arquivo} (${comandos.length} comandos)`);
  }
}

module.exports = { migrar, dividirComandos };
