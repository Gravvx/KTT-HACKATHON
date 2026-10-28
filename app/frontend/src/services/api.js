import axios from 'axios';

// Create Axios instance pointing to backend (/api works in dev via Vite proxy and in prod on Vercel)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Civic Issues API (Resolving & Tracking Real Municipal Problems)
export const civicAPI = {
  getAllIssues: async (category = null) => {
    const response = await api.get('/civic-issues', {
      params: category && category !== 'ALL' ? { category } : {},
    });
    return response.data;
  },

  getIssueById: async (id) => {
    const response = await api.get(`/civic-issues/${id}`);
    return response.data;
  },

  reportIssue: async (issueData) => {
    const response = await api.post('/civic-issues/report', issueData);
    return response.data;
  },

  upvoteIssue: async (id) => {
    const response = await api.post(`/civic-issues/${id}/upvote`);
    return response.data;
  },
};

// AI Citizen Assistant API with Multi-turn Conversation Memory & Audio Support
export const chatAPI = {
  sendMessage: async (
    message,
    language = 'en',
    apiKey = null,
    audioData = null,
    mimeType = null,
    history = []
  ) => {
    const response = await api.post('/chat/message', {
      message,
      language,
      apiKey,
      audioData,
      mimeType,
      history,
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
};

// Government Services & Applications API (Stored locally in JSON)
export const servicesAPI = {
  getAllServices: async (lang = 'en') => {
    const response = await api.get('/services', {
      params: { lang },
    });
    return response.data;
  },

  getServiceById: async (serviceId, lang = 'en') => {
    const response = await api.get(`/services/${serviceId}`, {
      params: { lang },
    });
    return response.data;
  },

  getApplications: async (phone = null) => {
    const response = await api.get('/services/applications', {
      params: phone ? { phone } : {},
    });
    return response.data;
  },

  submitApplication: async (applicationData) => {
    const response = await api.post('/services/apply', applicationData);
    return response.data;
  },
};

// Translation API
export const translationAPI = {
  translateText: async (text, targetLanguage, sourceLanguage = 'auto') => {
    const response = await api.post('/translate/text', {
      text,
      targetLanguage,
      sourceLanguage,
    });
    return response.data;
  },

  detectLanguage: async (text) => {
    const response = await api.post('/translate/detect', { text });
    return response.data;
  },
};

// Citizen Auth API
export const authAPI = {
  login: async ({ name, phone, preferredLanguage = 'en' }) => {
    const response = await api.post('/auth/login', {
      name,
      phone,
      preferredLanguage,
    });
    return response.data;
  },
};

export default api;
