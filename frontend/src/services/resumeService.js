import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

export const resumeService = {
  async getResumes() {
    const response = await axios.get(`${API_BASE}/resume/list`);
    return response.data;
  },

  async uploadResume(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE}/resume/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    return response.data;
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
  }
};