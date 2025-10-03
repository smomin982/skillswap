import api from './api';

export const getSkills = async (params = {}) => {
  const response = await api.get('/skills', { params });
  return response.data;
};

export const getSkill = async (id) => {
  const response = await api.get(`/skills/${id}`);
  return response.data;
};

export const createSkill = async (skillData) => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

export const getPopularSkills = async (limit = 10) => {
  const response = await api.get('/skills/popular', { params: { limit } });
  return response.data;
};

export const getSkillsByCategory = async (category) => {
  const response = await api.get(`/skills/category/${category}`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const addSkill = async (skillData) => {
  const response = await api.post('/users/skills', skillData);
  return response.data;
};

export const removeSkill = async (type, skillId) => {
  const response = await api.delete(`/users/skills/${type}/${skillId}`);
  return response.data;
};

export const searchUsers = async (params = {}) => {
  const response = await api.get('/users/search', { params });
  return response.data;
};

export const getMatches = async (params = {}) => {
  const response = await api.get('/users/matches', { params });
  return response.data;
};
