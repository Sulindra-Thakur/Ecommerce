// API configuration
// In client/src/lib/api.js or similar
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Default axios config
export const apiConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  }
};

// Check if API is available
export const checkApiConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shop/products/get?sortBy=price-lowtohigh`);
    return response.ok;
  } catch (error) {
    console.error('API connection error:', error);
    return false;
  }
}; 