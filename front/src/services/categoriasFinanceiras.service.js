import { apiRequest } from '../api/client';
import { mapCategoriaFinanceiraFromApi, mapCategoriaFinanceiraToApi } from '../mappers/categoriasFinanceiras.mapper';

export async function listarCategoriasFinanceiras() {
  const data = await apiRequest('/categorias-financeiras');
  return Array.isArray(data) ? data.map(mapCategoriaFinanceiraFromApi) : [];
}

export async function criarCategoriaFinanceira(payload) {
  const data = await apiRequest('/categorias-financeiras', {
    method: 'POST',
    body: JSON.stringify(mapCategoriaFinanceiraToApi(payload)),
  });
  return mapCategoriaFinanceiraFromApi(data);
}

export async function atualizarCategoriaFinanceira(id, payload) {
  const data = await apiRequest(`/categorias-financeiras/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapCategoriaFinanceiraToApi(payload)),
  });
  return mapCategoriaFinanceiraFromApi(data);
}

export async function inativarCategoriaFinanceira(id) {
  return apiRequest(`/categorias-financeiras/${id}`, { method: 'DELETE' });
}
