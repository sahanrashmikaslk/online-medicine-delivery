const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function api(path, method='GET', body, token){
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if(!res.ok){
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return await res.json();
}
