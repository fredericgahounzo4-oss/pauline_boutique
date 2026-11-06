const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (path) => `${BASE}/${String(path).replace(/^\/+/, '')}`;
