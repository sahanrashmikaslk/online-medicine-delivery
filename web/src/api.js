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
    let errorMsg = `HTTP ${res.status}`;
    
    try {
      const errorData = JSON.parse(t);
      if (errorData.error) {
        // Check if it's a validation error with detailed structure
        if (errorData.error.includes('minimum') && errorData.error.includes('name')) {
          errorMsg = 'Medicine name must be at least 2 characters long';
        } else if (errorData.error.includes('nonnegative') && errorData.error.includes('price')) {
          errorMsg = 'Price must be a positive number';
        } else if (errorData.error.includes('nonnegative') && errorData.error.includes('stock')) {
          errorMsg = 'Stock must be a positive number';
        } else if (errorData.error.includes('invalid credentials')) {
          errorMsg = 'Invalid email or password';
        } else if (errorData.error.includes('forbidden')) {
          errorMsg = 'Access denied';
        } else if (errorData.error.includes('unauthorized')) {
          errorMsg = 'Please log in again';
        } else {
          errorMsg = errorData.error;
        }
      }
    } catch (e) {
      // If not JSON, use the text as is
      errorMsg = t || errorMsg;
    }
    
    throw new Error(errorMsg);
  }
  return await res.json();
}
