const STATUS_FROM_BACKEND = { ATIVO: 'Ativo', INATIVO: 'Inativo' };
const STATUS_TO_BACKEND = { Ativo: 'ATIVO', Inativo: 'INATIVO', ATIVO: 'ATIVO', INATIVO: 'INATIVO' };

export function mapCategoriaFinanceiraFromApi(item = {}) {
  const tipo = item.tipo === 'DESPESA' ? 'DESPESA' : 'RECEITA';
  return {
    id: item.id,
    nome: item.nome || '',
    tipo,
    cor: item.cor || '',
    status: STATUS_FROM_BACKEND[item.status] || (item.ativo === false ? 'Inativo' : 'Ativo'),
    ativo: item.ativo ?? (item.status ? item.status !== 'INATIVO' : true),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export function mapCategoriaFinanceiraToApi(form = {}) {
  const payload = {
    nome: form.nome?.trim(),
    tipo: form.tipo === 'DESPESA' ? 'DESPESA' : 'RECEITA',
    cor: form.cor?.trim(),
    status: STATUS_TO_BACKEND[form.status] || undefined,
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined));
}
