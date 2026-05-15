import { apiRequest } from '../api/client';
import { mapEmpresaFromApi, mapEmpresaToApi } from '../mappers/empresas.mapper';

export async function listarEmpresas() {
  const data = await apiRequest('/empresas');
  return Array.isArray(data) ? data.map(mapEmpresaFromApi) : [];
}

export async function obterEmpresa(id) {
  const data = await apiRequest(`/empresas/${id}`);
  return mapEmpresaFromApi(data);
}

export async function criarEmpresa(payload) {
  const data = await apiRequest('/empresas', {
    method: 'POST',
    body: JSON.stringify(mapEmpresaToApi(payload)),
  });
  return mapEmpresaFromApi(data);
}

export async function atualizarEmpresa(id, payload) {
  const data = await apiRequest(`/empresas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapEmpresaToApi(payload)),
  });
  return mapEmpresaFromApi(data);
}

export async function inativarEmpresa(id) {
  return apiRequest(`/empresas/${id}`, { method: 'DELETE' });
}
