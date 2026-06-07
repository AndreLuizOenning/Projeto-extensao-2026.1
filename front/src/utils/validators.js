// ── Masks ──────────────────────────────────────────────────────────────────────

export function maskCPF(value) {
  const v = value.replace(/\D/g, '').slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCNPJ(value) {
  const v = value.replace(/\D/g, '').slice(0, 14);
  return v
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function maskCEP(value) {
  const v = value.replace(/\D/g, '').slice(0, 8);
  return v.replace(/(\d{5})(\d)/, '$1-$2');
}

export function maskPhone(value) {
  const v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

// ── Validators ─────────────────────────────────────────────────────────────────

export function validateCPF(cpf) {
  const c = cpf.replace(/\D/g, '');
  return c.length === 11;
}

export function validateCNPJ(cnpj) {
  const c = cnpj.replace(/\D/g, '');
  return c.length === 14;
}

export function validateCNPJorCPF(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return validateCPF(value) ? null : 'CPF inválido.';
  if (digits.length === 14) return validateCNPJ(value) ? null : 'CNPJ inválido.';
  if (digits.length === 0) return null;
  return 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.';
}

export function validateEmail(email) {
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'E-mail inválido.';
}

export function validatePositiveNumber(value) {
  const n = parseFloat(value);
  if (isNaN(n) || n <= 0) return 'Informe um valor maior que zero.';
  return null;
}

export function validateCEP(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return null;
  if (digits.length !== 8) return 'CEP deve ter 8 dígitos.';
  return null;
}
