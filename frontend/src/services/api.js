import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Auth Service ---
// By removing the headers config, the browser will automatically set the correct Content-Type with the boundary
export const registerUser = (formData) => api.post('/auth/register', formData);

export const loginUser = (credentials) => api.post('/auth/login', credentials, {
  headers: { 'Content-Type': 'application/json' },
});


// --- User Profile Service ---
export const getUserProfile = () => api.get('/user/profile');
export const updateUserProfile = (formData) => api.put('/user/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteUserProfile = () => api.delete('/user/profile');

// --- Election Service (Public) ---
export const getElections = () => api.get('/elections');
export const getElectionResults = (electionId) => api.get(`/results/${electionId}`);

// --- Vote Service (Voter) ---
export const castVote = (electionId, candidateId) => api.post(`/vote/${electionId}`, { candidateId });
export const getUserVotedElections = () => api.get('/user/voted-elections');
export const getUserVoteDetails = (electionId) => api.get(`/user/vote-details/${electionId}`);

// --- Admin Service ---
export const addElection = (electionData) => api.post('/admin/elections', electionData);
export const deleteElection = (electionId) => api.delete(`/admin/elections/${electionId}`);
export const declareResults = (electionId) => api.put(`/admin/elections/${electionId}/declare-results`);
export const revokeResults = (electionId) => api.put(`/admin/elections/${electionId}/revoke-results`);
export const addCandidate = (candidateData) => api.post('/admin/candidates', candidateData);
export const deleteCandidate = (candidateId) => api.delete(`/admin/candidates/${candidateId}`);
export const getAdminElectionResults = (electionId) => api.get(`/admin/election-results/${electionId}`);
export const addParty = (formData) => api.post('/admin/parties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getParties = () => api.get('/admin/parties');
export const updateParty = (id, formData) => api.put(`/admin/parties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteParty = (id) => api.delete(`/admin/parties/${id}`);
export const getUnvalidatedUsers = () => api.get('/admin/unvalidated-users');
export const validateUser = (userId) => api.put(`/admin/validate-user/${userId}`);
export const rejectUser = (userId, reason) => api.put(`/admin/reject-user/${userId}`, { reason });
export const getAllUsers = () => api.get('/admin/users');
export const getSingleUser = (userId) => api.get(`/admin/user/${userId}`);
export const adminUpdateUser = (userId, userData) => api.put(`/admin/user/${userId}`, userData);
export const adminDeleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const adminResetPassword = (userId, newPassword) => api.put(`/admin/users/${userId}/reset-password`, { newPassword });