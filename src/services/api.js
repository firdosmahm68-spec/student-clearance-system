import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// Clearance API
export const createClearanceRequest = (data) => api.post('/clearance', data);
export const getStudentRequests = () => api.get('/clearance/student');
export const getOfficeRequests = () => api.get('/clearance/office');
export const updateRequestStatus = (requestId, data) => 
  api.patch(`/clearance/${requestId}`, data);
export const getApprovalCount = (requestId) => 
  api.get(`/clearance/${requestId}/approval-count`);
export const getAllRequests = () => api.get('/clearance/all');
export const getAllOfficeRequests = () => api.get('/clearance/office/all');
export const getProcessedOfficeRequests = () => api.get('/clearance/office/processed');
// Add these to your API exports
export const generateCertificate = (requestId) => api.get(`/clearance/${requestId}/certificate`);
export const generateCertificatePDF = (requestId) => api.get(`/clearance/${requestId}/certificate-pdf`);
export default api;