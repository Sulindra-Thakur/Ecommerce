const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get API key from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '161a41b424185b784281e5bdab81a2b0';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Get the current weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
const getWeatherByCoordinates = async (lat, lon) => {
  try {
    // Validate inputs
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      console.log('Invalid coordinates:', lat, lon);
      return null;
    }

    const response = await fetch(
      `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.main || !data.weather || !data.weather[0]) {
      console.log('Invalid weather data structure:', data);
      return null;
    }
    
    return {
      temperature: data.main.temp,
      conditions: data.weather[0].main,
      location: data.name || 'Unknown location',
      weatherId: data.weather[0].id,
      description: data.weather[0].description || data.weather[0].main,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

/**
 * Calculate weather-based discount based on current conditions
 * @param {Object} weatherData - Weather data from API
 * @returns {Object} Discount information
 */
const calculateWeatherDiscount = (weatherData) => {
  // Check if weather data is valid
  if (!weatherData || !weatherData.temperature || !weatherData.conditions) {
    return {
      percentage: 0,
      reason: 'No weather data available'
    };
  }
  
  const { temperature, conditions, weatherId } = weatherData;
  
  // Default discount (no discount)
  let discount = {
    percentage: 0,
    reason: 'No weather-based discount available'
  };
  
  // Weather-based discount logic
  // Rain discount
  if (conditions === 'Rain' || conditions === 'Drizzle') {
    discount = {
      percentage: 10,
      reason: 'Rainy day discount!'
    };
  }
  
  // Extreme weather discount
  if (conditions === 'Thunderstorm' || conditions === 'Snow') {
    discount = {
      percentage: 15,
      reason: 'Extreme weather discount!'
    };
  }
  
  // Hot day discount (for summer products)
  if (temperature >= 25) {
    discount = {
      percentage: 12,
      reason: 'Hot day discount!'
    };
  }
  
  // Cold day discount (for winter products)
  if (temperature <= 15) {
    discount = {
      percentage: 12,
      reason: 'Cold weather discount!'
    };
  }
  
  // Mist/Fog discount (for rain products too)
  if (conditions === 'Mist' || conditions === 'Fog') {
    discount = {
      percentage: 8,
      reason: 'Foggy day discount!'
    };
  }
  
  return discount;
};

module.exports = {
  getWeatherByCoordinates,
  calculateWeatherDiscount
}; 