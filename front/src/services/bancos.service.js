import { apiRequest } from '../api/client';
import { mapBancoFromApi, mapBancoToApi } from '../mappers/bancos.mapper';

export async function listarBancos() {
  const data = await apiRequest('/bancos');
  return Array.isArray(data) ? data.map(mapBancoFromApi) : [];
}

export async function obterBanco(id) {
  const data = await apiRequest(`/bancos/${id}`);
  return mapBancoFromApi(data);
}

export async function criarBanco(payload) {
  const data = await apiRequest('/bancos', {
    method: 'POST',
    body: JSON.stringify(mapBancoToApi(payload)),
  });
  return mapBancoFromApi(data);
}

export async function atualizarBanco(id, payload) {
  const data = await apiRequest(`/bancos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapBancoToApi(payload)),
  });
  return mapBancoFromApi(data);
}

export async function inativarBanco(id) {
  return apiRequest(`/bancos/${id}`, { method: 'DELETE' });
}
