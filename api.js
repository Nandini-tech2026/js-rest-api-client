const BASE = 'https://fakestoreapi.com';

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const getProducts = () => request('/products');
export const getCategories = () => request('/products/categories');
