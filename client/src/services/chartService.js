import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error.response?.data || new Error('An unexpected error occurred.'));
  }
);

class ChartService {
  generateChart(birthData) {
    return api.post('/chart/generate', birthData);
  }

  generateComprehensiveChart(birthData) {
    return api.post('/chart/generate/comprehensive', birthData);
  }

  analyzeBirthData(birthData) {
    return api.post('/chart/analysis/birth-data', birthData);
  }

  getChart(chartId) {
    return api.get(`/chart/${chartId}`);
  }

  getNavamsaChart(chartId) {
    return api.get(`/chart/${chartId}/navamsa`);
  }

  getUserCharts() {
    return api.get('/user/charts');
  }

  updateChart(chartId, updateData) {
    return api.put(`/chart/${chartId}`, updateData);
  }

  deleteChart(chartId) {
    return api.delete(`/chart/${chartId}`);
  }
}

export default new ChartService();
