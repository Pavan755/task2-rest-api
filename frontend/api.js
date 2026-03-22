
const BASE_URL = 'https://task2-rest-api.onrender.com/api';

// ── Token helpers ─────────────────────────────────────────────────────────
const getAccessToken  = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ── Auto-refresh: if a request fails with 403, try refreshing the token ───
const fetchWithAuth = async (url, options = {}) => {
  // Attach the access token to every request
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAccessToken()}`,
  };

  let response = await fetch(url, options);

  // If token expired (403), try to get a new one using the refresh token
  if (response.status === 403) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the original request with the new token
      options.headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(url, options);
    } else {
      // Refresh also failed — force logout
      clearTokens();
      window.location.href = 'login.html';
      return;
    }
  }

  return response;
};

const tryRefreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    saveTokens(data.accessToken, null); // only access token comes back
    return true;
  } catch {
    return false;
  }
};

// ── Auth API calls ─────────────────────────────────────────────────────────
const register = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
};

const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// ── Notes API calls ────────────────────────────────────────────────────────
const getNotes = async () => {
  const res = await fetchWithAuth(`${BASE_URL}/notes`);
  return res.json();
};

const createNote = async (title, content) => {
  const res = await fetchWithAuth(`${BASE_URL}/notes`, {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });
  return res.json();
};

const deleteNote = async (id) => {
  const res = await fetchWithAuth(`${BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};