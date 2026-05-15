import { apiRequest } from '../api/client';
import { mapCentroCustoFromApi, mapCentroCustoToApi } from '../mappers/centrosCusto.mapper';

export async function listarCentrosCusto() {
  const data = await apiRequest('/centros-custo');
  return Array.isArray(data) ? data.map(mapCentroCustoFromApi) : [];
}

export async function criarCentroCusto(payload) {
  const data = await apiRequest('/centros-custo', {
    method: 'POST',
    body: JSON.stringify(mapCentroCustoToApi(payload)),
  });
  return mapCentroCustoFromApi(data);
}

export async function atualizarCentroCusto(id, payload) {
  const data = await apiRequest(`/centros-custo/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapCentroCustoToApi(payload)),
  });
  return mapCentroCustoFromApi(data);
}

export async function inativarCentroCusto(id) {
  return apiRequest(`/centros-custo/${id}`, { method: 'DELETE' });
}
