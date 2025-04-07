// API configuration
const getBaseUrl = () => {
  // For production, use the same domain (relative URL)
  if (import.meta.env.PROD) {
    return '';
  }
  // For development, use localhost with port
  return 'http://localhost:5002';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Builds API URLs based on the current environment
 * In development: Uses localhost with specified port
 * In production: Uses relative URLs which will resolve to the same domain
 * @param {string} endpoint - The API endpoint (without leading slash)
 * @returns {string} - The complete URL for the API endpoint
 */
export function buildApiUrl(endpoint) {
  // For development environment
  if (import.meta.env.DEV) {
    return `http://localhost:5002/${endpoint}`;
  }
  
  // For production environment - use relative URL
  // This will automatically use the same domain where the frontend is hosted
  return `/${endpoint}`;
}

/**
 * Gets the WebSocket URL for real-time features
 * @returns {string} - WebSocket URL 
 */
export function getWebSocketUrl() {
  if (import.meta.env.DEV) {
    return 'ws://localhost:5002';
  }
  
  // In production, use the current host with wss protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

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

export default buildApiUrl; 