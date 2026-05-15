import { apiRequest } from '../api/client';
import { mapContaBancariaFromApi, mapContaBancariaToApi } from '../mappers/contasBancarias.mapper';

export async function listarContasBancarias() {
  const data = await apiRequest('/contas-bancarias');
  return Array.isArray(data) ? data.map(mapContaBancariaFromApi) : [];
}

export async function obterContaBancaria(id) {
  const data = await apiRequest(`/contas-bancarias/${id}`);
  return mapContaBancariaFromApi(data);
}

export async function criarContaBancaria(payload) {
  const data = await apiRequest('/contas-bancarias', {
    method: 'POST',
    body: JSON.stringify(mapContaBancariaToApi(payload)),
  });
  return mapContaBancariaFromApi(data);
}

export async function atualizarContaBancaria(id, payload) {
  const data = await apiRequest(`/contas-bancarias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapContaBancariaToApi(payload)),
  });
  return mapContaBancariaFromApi(data);
}

export async function inativarContaBancaria(id) {
  return apiRequest(`/contas-bancarias/${id}`, { method: 'DELETE' });
}
