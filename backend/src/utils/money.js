export function decimalToCents(value, { allowNegative = true } = {}) {
  if (value === null || value === undefined) throw new Error('Valor monetário ausente.');

  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error('Valor monetário inválido.');
  }

  const normalized = String(value).trim().replace(',', '.');
  if (!normalized) throw new Error('Valor monetário inválido.');
  if (!/^[-+]?\d+(\.\d{1,2})?$/.test(normalized)) throw new Error('Valor monetário inválido.');

  const negative = normalized.startsWith('-');
  if (!allowNegative && negative) throw new Error('Valor monetário não pode ser negativo.');

  const abs = negative || normalized.startsWith('+') ? normalized.slice(1) : normalized;
  const [intPart, decPart = ''] = abs.split('.');
  const cents = Number(intPart) * 100 + Number((decPart + '00').slice(0, 2));
  return negative ? -cents : cents;
}

export function centsToDecimal(cents) {
  if (!Number.isInteger(cents)) throw new Error('Centavos inválidos.');
  return (cents / 100).toFixed(2);
}
