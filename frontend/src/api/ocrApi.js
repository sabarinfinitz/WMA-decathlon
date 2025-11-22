import api from './api.js';

// OCR Weight API endpoints
export const ocrApi = {
  // Submit OCR weight data
  submitWeight: async (weightData) => {
    try {
      const response = await api.post('/ocr/weight', weightData);
      return response.data;
    } catch (error) {
      console.error('❌ OCR API Error (submitWeight):', error);
      throw error;
    }
  },

  // Get all OCR weight records
  getAllWeights: async () => {
    try {
      const response = await api.get('/ocr/weights');
      return response.data;
    } catch (error) {
      console.error('❌ OCR API Error (getAllWeights):', error);
      throw error;
    }
  },

  // Delete OCR weight record
  deleteWeight: async (id) => {
    try {
      const response = await api.delete(`/ocr/weight/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ OCR API Error (deleteWeight):', error);
      throw error;
    }
  },
};