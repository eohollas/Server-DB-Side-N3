const test = require('node:test');
const assert = require('node:assert/strict');
const { classificar } = require('../src/services/classificacao');
const { dividirComandos } = require('../src/db/migrar');

test('classifica pelo preço nos limites do enunciado', () => {
  assert.equal(classificar(0.01), 'popular');
  assert.equal(classificar(49999.99), 'popular');
  assert.equal(classificar(50000), 'luxo');
  assert.equal(classificar(99999.99), 'luxo');
  assert.equal(classificar(100000), 'super luxo');
  assert.equal(classificar(520000), 'super luxo');
});

test('divide scripts com DELIMITER (triggers/procedures)', () => {
  const sql = [
    'CREATE TABLE a (id INT);',
    'DELIMITER $$',
    'CREATE TRIGGER t BEFORE INSERT ON a FOR EACH ROW',
    'BEGIN',
    '  SET NEW.id = 1; -- comentário',
    'END$$',
    'DELIMITER ;',
    '-- só comentário;',
    'INSERT INTO a VALUES (2);',
  ].join('\n');
  const cmds = dividirComandos(sql);
  assert.equal(cmds.length, 3);
  assert.match(cmds[1], /^CREATE TRIGGER/);
  assert.match(cmds[1], /SET NEW\.id = 1;/);
  assert.ok(!cmds[1].endsWith('$$'));
});
