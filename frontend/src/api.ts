import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const getCompanies = () => api.get('/companies').then(res => res.data);
export const getStockData = (symbol: string, days: number = 30) => api.get(`/data/${symbol}?days=${days}`).then(res => res.data);
export const getSummary = (symbol: string) => api.get(`/summary/${symbol}`).then(res => res.data);
export const compareStocks = (symbol1: string, symbol2: string) => api.get(`/compare?symbol1=${symbol1}&symbol2=${symbol2}`).then(res => res.data);
export const getPrediction = (symbol: string) => api.get(`/predict/${symbol}`).then(res => res.data);
