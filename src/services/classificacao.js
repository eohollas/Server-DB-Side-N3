function classificar(preco) {
  const centavos = Math.round(Number(preco) * 100);
  if (centavos < 5000000) return 'popular';
  if (centavos < 10000000) return 'luxo';
  return 'super luxo';
}

module.exports = { classificar };
