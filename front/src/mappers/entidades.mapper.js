const STATUS_FROM_BACKEND = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  PENDENTE: 'Pendente',
  NEGATIVO: 'Negativo',
};

const STATUS_TO_BACKEND = {
  Ativo: 'ATIVO',
  Inativo: 'INATIVO',
  Pendente: 'PENDENTE',
  Negativo: 'NEGATIVO',
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  PENDENTE: 'PENDENTE',
  NEGATIVO: 'NEGATIVO',
};

const TIPO_TO_BACKEND = {
  Cliente: 'Cliente',
  Fornecedor: 'Fornecedor',
  Funcionário: 'Funcionário',
  Parceiro: 'Parceiro',
};

function cleanDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

export function mapEntidadeFromApi(entidade = {}) {
  return {
    id: entidade.id,
    nome: entidade.nome || '',
    tipo: entidade.tipo || '',
    empresaId: entidade.empresa_id ?? '',
    contato: entidade.contato || '',
    status: STATUS_FROM_BACKEND[entidade.status] || 'Ativo',
    cnpjCpf: entidade.cnpj_cpf || '',
    endereco: entidade.endereco || '',
    createdAt: entidade.created_at,
    updatedAt: entidade.updated_at,
  };
}

export function mapEntidadeToApi(form = {}) {
  const payload = {
    nome: form.nome?.trim(),
    tipo: TIPO_TO_BACKEND[form.tipo] || form.tipo,
    empresa_id: form.empresaId ? Number(form.empresaId) : null,
    contato: form.contato?.trim(),
    status: STATUS_TO_BACKEND[form.status] || 'ATIVO',
    cnpj_cpf: cleanDigits(form.cnpjCpf),
    endereco: form.endereco?.trim(),
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined),
  );
}
