import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
  },

  // Signup
  signup: async (userData) => {
    const response = await api.post("/auth/signup/", userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post("/auth/logout/");
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/user/");
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  // Get all quizzes
  getAll: async () => {
    const response = await api.get("/quizzes/");
    return response.data;
  },

  // Get single quiz with questions
  getById: async (id) => {
    const response = await api.get(`/quizzes/${id}/`);
    return response.data;
  },

  // Submit quiz answers
  submit: async (quizId, data) => {
    const response = await api.post(`/quizzes/${quizId}/submit/`, data);
    return response.data;
  },

  // Get quiz leaderboard
  getLeaderboard: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/leaderboard/`);
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  // Get global leaderboard
  getGlobal: async () => {
    const response = await api.get("/leaderboard/");
    return response.data;
  },
};

// Attempt API
export const attemptAPI = {
  // Get attempt details
  getById: async (id) => {
    const response = await api.get(`/attempts/${id}/`);
    return response.data;
  },

  // Get user attempts
  getUserAttempts: async () => {
    const response = await api.get("/attempts/");
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  // Get user stats
  getUserStats: async () => {
    const response = await api.get("/stats/");
    return response.data;
  },
};

export default api;
