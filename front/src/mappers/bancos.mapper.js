const STATUS_FROM_BACKEND = { ATIVO: 'Ativo', INATIVO: 'Inativo', ATIVA: 'Ativo', INATIVA: 'Inativo' };
const STATUS_TO_BACKEND = { Ativo: 'ATIVO', Inativo: 'INATIVO', ATIVO: 'ATIVO', INATIVO: 'INATIVO' };

export function mapBancoFromApi(banco = {}) {
  return {
    id: banco.id,
    codigo: banco.codigo || '',
    nome: banco.nome || '',
    ispb: banco.ispb || '',
    status: STATUS_FROM_BACKEND[banco.status] || (banco.ativo === false ? 'Inativo' : 'Ativo'),
    ativo: banco.ativo ?? (banco.status ? banco.status !== 'INATIVO' && banco.status !== 'INATIVA' : true),
    createdAt: banco.created_at,
    updatedAt: banco.updated_at,
  };
}

export function mapBancoToApi(form = {}) {
  const payload = {
    codigo: form.codigo?.trim(),
    nome: form.nome?.trim(),
    ispb: form.ispb?.trim(),
    status: STATUS_TO_BACKEND[form.status] || 'ATIVO',
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined));
}
