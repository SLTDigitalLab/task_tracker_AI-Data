// Centralized API configuration
// In production on Vercel, set VITE_API_URL in Vercel project environment variables (e.g. https://your-backend.onrender.com)
// In local development, falls back to http://localhost:5001
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
export default API_BASE_URL;
