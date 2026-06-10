import axios from 'axios';

const api = axios.create({
  baseURL: 'https://petluxe-backend-production-9881.up.railway.app/api',
  headers: {
    'Accept': 'application/json',
  },
});

// Automatically attach Sanctum token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('petluxe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import toast from 'react-hot-toast';

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Clear local storage and redirect if unauthorized
        localStorage.removeItem('petluxe_token');
        localStorage.removeItem('petluxe_user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      } else if (status >= 500) {
        toast.error('Oups ! Notre serveur rencontre un problème temporaire. Veuillez réessayer dans quelques instants.', { id: 'server-error' });
      } else if (status === 404) {
        toast.error('La ressource demandée est introuvable.', { id: 'not-found' });
      } else if (status === 422) {
        // Validation errors are usually handled at the component level
      } else {
        toast.error('Une erreur inattendue est survenue.', { id: 'general-error' });
      }
    } else if (error.request) {
      // Network error (No response received)
      toast.error('Erreur de réseau. Veuillez vérifier votre connexion internet.', { id: 'network-error' });
    } else {
      toast.error('Une erreur inattendue est survenue.', { id: 'unknown-error' });
    }
    
    // Return a resolved promise with dummy data so the UI doesn't crash on unhandled rejections
    // Or return reject so components can catch it if they want.
    // It's usually better to reject, but the prompt asks to never show a white page or unhandled exception.
    // By rejecting, React components must try/catch. If they don't, it might break.
    return Promise.reject(error);
  }
);

export default api;
