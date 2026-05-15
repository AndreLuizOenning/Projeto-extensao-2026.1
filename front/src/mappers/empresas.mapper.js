const STATUS_FROM_BACKEND = { ATIVA: 'Ativa', INATIVA: 'Inativa' };
const STATUS_TO_BACKEND = { Ativa: 'ATIVA', Inativa: 'INATIVA', ATIVA: 'ATIVA', INATIVA: 'INATIVA' };

function cleanCnpj(value = '') { return String(value).replace(/\D/g, ''); }

export function mapEmpresaFromApi(empresa = {}) {
  return {
    id: empresa.id,
    nome: empresa.nome || '',
    razaoSocial: empresa.razao_social || '',
    nomeFantasia: empresa.nome_fantasia || '',
    cnpj: empresa.cnpj || '',
    categoria: empresa.categoria || '',
    cep: empresa.cep || '',
    pais: empresa.pais || 'Brasil',
    estado: empresa.estado || '',
    cidade: empresa.cidade || '',
    rua: empresa.rua || '',
    descricao: empresa.descricao || '',
    status: STATUS_FROM_BACKEND[empresa.status] || 'Ativa',
    createdAt: empresa.created_at,
    updatedAt: empresa.updated_at,
  };
}

export function mapEmpresaToApi(form = {}) {
  const payload = {
    nome: form.nome?.trim(),
    razao_social: form.razaoSocial?.trim(),
    nome_fantasia: form.nomeFantasia?.trim(),
    cnpj: cleanCnpj(form.cnpj),
    categoria: form.categoria?.trim(),
    cep: form.cep?.trim(),
    pais: form.pais?.trim(),
    estado: form.estado?.trim(),
    cidade: form.cidade?.trim(),
    rua: form.rua?.trim(),
    descricao: form.descricao?.trim(),
    status: STATUS_TO_BACKEND[form.status] || 'ATIVA',
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined));
}
