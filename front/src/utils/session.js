const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) return false;

  try {
    // Decodifica o payload do JWT (base64url) para verificar expiração sem biblioteca externa
    const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Payload));
    if (payload.exp && Date.now() / 1000 >= payload.exp) {
      clearSession();
      return false;
    }
    return true;
  } catch {
    // Token malformado — limpa a sessão por segurança
    clearSession();
    return false;
  }
}
