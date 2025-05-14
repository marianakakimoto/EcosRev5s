// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Replace with your actual API URL
  timeout: 10000,
});

export default api;