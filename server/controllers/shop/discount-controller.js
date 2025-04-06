const { getWeatherByCoordinates, calculateWeatherDiscount } = require("../../helpers/weatherService");

/**
 * Apply weather-based discounts based on user's location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWeatherDiscount = async (req, res) => {
  try {
    const { latitude, longitude, productIds } = req.body;

    // Validate input
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid location coordinates are required",
      });
    }

    // Get weather data based on coordinates
    const weatherData = await getWeatherByCoordinates(parseFloat(latitude), parseFloat(longitude));
    
    // Handle case where weather data couldn't be fetched
    if (!weatherData) {
      return res.status(200).json({
        success: true,
        data: {
          discount: { percentage: 0, reason: 'Weather data unavailable' },
          weather: null
        }
      });
    }
    
    // Calculate discount based on weather conditions
    const discountInfo = calculateWeatherDiscount(weatherData);
    
    // Return discount information along with weather data
    res.status(200).json({
      success: true,
      data: {
        discount: discountInfo,
        weather: {
          temperature: weatherData.temperature,
          conditions: weatherData.conditions,
          location: weatherData.location,
          description: weatherData.description,
          icon: weatherData.icon
        }
      }
    });
  } catch (error) {
    console.log("Weather discount error:", error);
    res.status(200).json({
      success: true,
      data: {
        discount: { percentage: 0, reason: 'Weather service temporarily unavailable' },
        weather: null
      }
    });
  }
};

module.exports = { getWeatherDiscount }; 