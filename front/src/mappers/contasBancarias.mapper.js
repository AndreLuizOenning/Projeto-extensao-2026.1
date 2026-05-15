function toMoneyNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const normalized = Number(String(value).replace(',', '.'));
  if (Number.isNaN(normalized)) return undefined;
  return Number(normalized.toFixed(2));
}

export function mapContaBancariaFromApi(conta = {}) {
  return {
    id: conta.id,
    empresaId: conta.empresa_id ?? '',
    bancoId: conta.banco_id ?? '',
    agencia: conta.agencia || '',
    conta: conta.conta || '',
    digito: conta.digito || '',
    pix: conta.pix || '',
    tipoConta: conta.tipo_conta || 'CORRENTE',
    saldoInicial: conta.saldo_inicial ?? 0,
    saldoAtual: conta.saldo_atual ?? 0,
    status: conta.status || (conta.ativo === false ? 'INATIVO' : 'ATIVO'),
    createdAt: conta.created_at,
    updatedAt: conta.updated_at,
  };
}

export function mapContaBancariaToApi(form = {}) {
  const payload = {
    empresa_id: form.empresaId ? Number(form.empresaId) : undefined,
    banco_id: form.bancoId ? Number(form.bancoId) : undefined,
    agencia: form.agencia?.trim(),
    conta: form.conta?.trim(),
    digito: form.digito?.trim(),
    pix: form.pix?.trim(),
    tipo_conta: form.tipoConta,
    saldo_inicial: toMoneyNumber(form.saldoInicial),
    status: form.status,
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined));
}
