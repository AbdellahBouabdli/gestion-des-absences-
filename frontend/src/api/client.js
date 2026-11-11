import axios from 'axios';

export const TOKEN_KEY = 'campus_presence_token';
export const USER_KEY = 'campus_presence_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isLogin = error?.config?.url?.includes('/auth/login');
    if (status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event('campus:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.code === 'ERR_NETWORK') {
    return "Le serveur est injoignable. Vérifiez que l'API est démarrée sur le port 8080.";
  }
  if (error?.response?.status === 403) {
    return "Vous n'avez pas accès à cette action.";
  }
  return error?.message || fallback;
}

export default api;
