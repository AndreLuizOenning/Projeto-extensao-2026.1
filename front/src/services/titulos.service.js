import { apiRequest } from '../api/client';
import { mapTituloFromApi, mapTituloToApi } from '../mappers/titulos.mapper';

function toQueryString(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) params.append(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listarTitulos(filtros = {}) {
  const data = await apiRequest(`/titulos${toQueryString(filtros)}`);
  return Array.isArray(data) ? data.map(mapTituloFromApi) : [];
}

export async function obterTitulo(id) {
  const data = await apiRequest(`/titulos/${id}`);
  return mapTituloFromApi(data);
}

export async function criarTitulo(payload) {
  const data = await apiRequest('/titulos', {
    method: 'POST',
    body: JSON.stringify(mapTituloToApi(payload)),
  });
  return mapTituloFromApi(data);
}

export async function atualizarTitulo(id, payload) {
  const data = await apiRequest(`/titulos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapTituloToApi(payload)),
  });
  return mapTituloFromApi(data);
}

export async function cancelarTitulo(id) {
  const data = await apiRequest(`/titulos/${id}/cancelar`, { method: 'POST' });
  return data ? mapTituloFromApi(data) : data;
}

export async function registrarBaixa(id, payload) {
  return apiRequest(`/titulos/${id}/baixas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
