import api from './api';

export const createSession = async (sessionData) => {
  const response = await api.post('/sessions', sessionData);
  return response.data;
};

export const getSessions = async (params = {}) => {
  const response = await api.get('/sessions', { params });
  return response.data;
};

export const getSession = async (id) => {
  const response = await api.get(`/sessions/${id}`);
  return response.data;
};

export const updateSession = async (id, sessionData) => {
  const response = await api.put(`/sessions/${id}`, sessionData);
  return response.data;
};

export const completeSession = async (id, feedbackData) => {
  const response = await api.put(`/sessions/${id}/complete`, feedbackData);
  return response.data;
};

export const cancelSession = async (id) => {
  const response = await api.put(`/sessions/${id}/cancel`);
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const getUserReviews = async (userId, params = {}) => {
  const response = await api.get(`/reviews/user/${userId}`, { params });
  return response.data;
};

export const getReview = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
