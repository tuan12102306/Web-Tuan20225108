export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token is expired
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
};
