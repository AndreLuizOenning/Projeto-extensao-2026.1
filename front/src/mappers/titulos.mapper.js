function toMoneyNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const normalized = Number(String(value).replace(',', '.'));
  if (Number.isNaN(normalized)) return undefined;
  return Number(normalized.toFixed(2));
}

function parseOptionalId(value, label) {
  if (value === '' || value === null || value === undefined) return undefined;
  const converted = Number(value);
  if (!Number.isFinite(converted)) {
    throw new Error(`Valor inválido para ${label}.`);
  }
  return converted;
}

export function mapTituloFromApi(item = {}) {
  return {
    id: item.id,
    tipo: item.tipo || 'RECEBER',
    status: item.status || 'PENDENTE',
    descricao: item.descricao || '',
    observacoes: item.observacoes || '',
    empresaId: item.empresa_id ?? '',
    entidadeId: item.entidade_id ?? '',
    categoriaId: item.categoria_id ?? '',
    centroCustoId: item.centro_custo_id ?? '',
    contaBancariaId: item.conta_bancaria_id ?? '',
    valorOriginal: item.valor_original ?? 0,
    valorSaldo: item.valor_saldo ?? item.valor_original ?? 0,
    dataEmissao: item.data_emissao || '',
    dataVencimento: item.data_vencimento || '',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export function mapTituloToApi(form = {}) {
  const payload = {
    tipo: form.tipo,
    descricao: form.descricao?.trim(),
    observacoes: form.observacoes?.trim(),
    empresa_id: form.empresaId ? Number(form.empresaId) : undefined,
    // IDs opcionais vazios são omitidos do payload (não enviamos null).
    entidade_id: parseOptionalId(form.entidadeId, 'Entidade'),
    categoria_id: parseOptionalId(form.categoriaId, 'Categoria'),
    centro_custo_id: parseOptionalId(form.centroCustoId, 'Centro de Custo'),
    conta_bancaria_id: parseOptionalId(form.contaBancariaId, 'Conta Bancária'),
    valor_original: toMoneyNumber(form.valorOriginal),
    data_emissao: form.dataEmissao || undefined,
    data_vencimento: form.dataVencimento || undefined,
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined));
}
