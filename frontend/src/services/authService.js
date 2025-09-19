import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

export const authService = {
  async login(credentials) {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data;
  },

  async register(userData) {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    return response.data;
  }
};