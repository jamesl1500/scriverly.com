/**
 * apiClient.ts
 * -----------------
 * This file sets up and exports an Axios instance configured to communicate with the backend API.
 * 
 * @module src/libs/apiClient
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default apiClient;
