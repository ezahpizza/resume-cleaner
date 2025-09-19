import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8000';
const API_BASE = `${BACKEND_URL}/api`;

// Add axios interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error - Backend server may not be running');
      throw new Error('Unable to connect to server. Please ensure the backend is running on ' + BACKEND_URL);
    }
    return Promise.reject(error);
  }
);

export const resumeService = {
  async getResumes() {
    try {
      const response = await axios.get(`${API_BASE}/resume/list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },

  async uploadResume(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },

  async cleanResume(resumeId) {
    const response = await axios.post(`${API_BASE}/resume/clean`, {
      resume_id: resumeId
    });
    return response.data;
  },

  async downloadResume(resumeId) {
    const response = await axios.get(`${API_BASE}/resume/${resumeId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async getResume(resumeId) {
    const response = await axios.get(`${API_BASE}/resume/${resumeId}`);
    return response.data;
  },

  async healthCheck() {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};