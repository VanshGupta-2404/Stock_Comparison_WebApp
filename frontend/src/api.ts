import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "https://stock-comparison-webapp.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Add a request interceptor to log outgoing requests
api.interceptors.request.use(config => {
  console.log("Calling API:", config.baseURL + (config.url || ""));
  return config;
});

export const getCompanies = () => api.get('/companies').then(res => res.data);
export const getStockData = (symbol: string, days: number = 30) => api.get(`/data/${symbol}?days=${days}`).then(res => res.data);
export const getSummary = (symbol: string) => api.get(`/summary/${symbol}`).then(res => res.data);
export const compareStocks = (symbol1: string, symbol2: string) => api.get(`/compare?symbol1=${symbol1}&symbol2=${symbol2}`).then(res => res.data);
export const getPrediction = (symbol: string) => api.get(`/predict/${symbol}`).then(res => res.data);
