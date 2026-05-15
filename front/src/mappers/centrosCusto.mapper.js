const STATUS_FROM_BACKEND = { ATIVO: 'Ativo', INATIVO: 'Inativo' };
const STATUS_TO_BACKEND = { Ativo: 'ATIVO', Inativo: 'INATIVO', ATIVO: 'ATIVO', INATIVO: 'INATIVO' };

export function mapCentroCustoFromApi(item = {}) {
  return {
    id: item.id,
    empresaId: item.empresa_id ?? item.empresaId ?? '',
    nome: item.nome || '',
    codigo: item.codigo || '',
    status: STATUS_FROM_BACKEND[item.status] || (item.ativo === false ? 'Inativo' : 'Ativo'),
    ativo: item.ativo ?? (item.status ? item.status !== 'INATIVO' : true),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export function mapCentroCustoToApi(form = {}) {
  const payload = {
    empresa_id: form.empresaId ? Number(form.empresaId) : undefined,
    nome: form.nome?.trim(),
    codigo: form.codigo?.trim(),
    status: STATUS_TO_BACKEND[form.status] || undefined,
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined));
}
