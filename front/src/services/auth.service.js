import { apiRequest } from '../api/client';

export async function login({ cpf, senha }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ cpf, senha }),
  });
}
