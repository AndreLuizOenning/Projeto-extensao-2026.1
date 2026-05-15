import { clearSession, getToken } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (response.status === 401) {
    clearSession();
    redirectToLogin();
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Erro ao processar requisição.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
