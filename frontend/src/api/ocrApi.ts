import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same base URL as the existing API
const BASE_URL = "http://localhost:3000/api";

// Create axios instance for OCR API
const ocrApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add token to requests
ocrApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface OCRSubmissionData {
  weight: number;
  imageUri?: string;
  timestamp?: string;
  rawOcrText?: string;
}

export interface OCRWeight {
  _id: string;
  weight: number;
  imageUri?: string;
  rawOcrText?: string;
  timestamp: string;
  submittedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const ocrApiService = {
  /**
   * Submit OCR weight data to backend
   */
  submitWeight: async (data: OCRSubmissionData): Promise<{ success: boolean; message: string; data?: OCRWeight }> => {
    try {
      const response = await ocrApi.post('/ocr/weight', data);
      return response.data;
    } catch (error) {
      console.error('OCR API Error:', error);
      throw error;
    }
  },

  /**
   * Get all OCR weight records
   */
  getAllWeights: async (): Promise<{ success: boolean; count: number; weights: OCRWeight[] }> => {
    try {
      const response = await ocrApi.get('/ocr/weights');
      return response.data;
    } catch (error) {
      console.error('OCR API Error:', error);
      throw error;
    }
  },

  /**
   * Delete an OCR weight record
   */
  deleteWeight: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await ocrApi.delete(`/ocr/weight/${id}`);
      return response.data;
    } catch (error) {
      console.error('OCR API Error:', error);
      throw error;
    }
  }
};