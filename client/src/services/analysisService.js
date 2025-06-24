// Analysis API Service
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class AnalysisService {
  async analyzeLagna(chartId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/lagna`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ chartId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing lagna:', error);
      throw error;
    }
  }

  async analyzeHouses(chartId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/houses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ chartId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing houses:', error);
      throw error;
    }
  }

  async analyzeAspects(chartId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/aspects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ chartId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing aspects:', error);
      throw error;
    }
  }

  async analyzeDasha(chartId) {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/dasha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ chartId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing dasha:', error);
      throw error;
    }
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AnalysisService();
