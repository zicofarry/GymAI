import axios from 'axios';

// Gunakan Env Var VITE_API_URL, jika tidak ada (local) pakai localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: baseURL,
});