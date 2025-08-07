import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Auth Service ---
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// --- Election Service (Public) ---
export const getElections = () => api.get('/elections');
export const getElectionResults = (electionId) => api.get(`/results/${electionId}`);

// --- Vote Service (Voter) ---
export const castVote = (electionId, candidateId) => api.post(`/vote/${electionId}`, { candidateId });
// **NEW FUNCTION**
export const getUserVotedElections = () => api.get('/user/voted-elections');
export const getUserProfile = () => api.get('/user/profile');
export const getUserVoteDetails = (electionId) => api.get(`/user/vote-details/${electionId}`);
export const getAdminElectionResults = (electionId) => api.get(`/admin/election-results/${electionId}`);

// --- Admin Service ---
export const addElection = (electionData) => api.post('/admin/elections', electionData);
export const deleteElection = (electionId) => api.delete(`/admin/elections/${electionId}`);
export const addCandidate = (candidateData) => api.post('/admin/candidates', candidateData);
export const deleteCandidate = (candidateId) => api.delete(`/admin/candidates/${candidateId}`);