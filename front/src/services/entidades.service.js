import { apiRequest } from '../api/client';
import { mapEntidadeFromApi, mapEntidadeToApi } from '../mappers/entidades.mapper';

export async function listarEntidades() {
  const data = await apiRequest('/entidades');
  return Array.isArray(data) ? data.map(mapEntidadeFromApi) : [];
}

export async function obterEntidade(id) {
  const data = await apiRequest(`/entidades/${id}`);
  return mapEntidadeFromApi(data);
}

export async function criarEntidade(payload) {
  const data = await apiRequest('/entidades', {
    method: 'POST',
    body: JSON.stringify(mapEntidadeToApi(payload)),
  });
  return mapEntidadeFromApi(data);
}

export async function atualizarEntidade(id, payload) {
  const data = await apiRequest(`/entidades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapEntidadeToApi(payload)),
  });
  return mapEntidadeFromApi(data);
}

export async function inativarEntidade(id) {
  return apiRequest(`/entidades/${id}`, { method: 'DELETE' });
}
