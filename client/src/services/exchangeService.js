import api from './api';

export const createExchange = async (exchangeData) => {
  const response = await api.post('/exchanges', exchangeData);
  return response.data;
};

export const getExchanges = async (params = {}) => {
  const response = await api.get('/exchanges', { params });
  return response.data;
};

export const getExchange = async (id) => {
  const response = await api.get(`/exchanges/${id}`);
  return response.data;
};

export const updateExchangeStatus = async (id, status) => {
  const response = await api.put(`/exchanges/${id}/status`, { status });
  return response.data;
};

export const completeExchange = async (id) => {
  const response = await api.put(`/exchanges/${id}/complete`);
  return response.data;
};

export const deleteExchange = async (id) => {
  const response = await api.delete(`/exchanges/${id}`);
  return response.data;
};
