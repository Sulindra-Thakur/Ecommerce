// API configuration
export const API_BASE_URL = 'http://localhost:5002';

// Helper function to build API URLs
export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

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