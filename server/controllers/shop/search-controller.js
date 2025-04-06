const Product = require("../../models/Product");
const { getWeatherByCoordinates, calculateWeatherDiscount } = require("../../helpers/weatherService");

/**
 * Search for products across various attributes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    const { latitude, longitude } = req.query;
    
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    // Create case insensitive regex for searching
    const regEx = new RegExp(keyword, "i");

    // Search across multiple fields
    const createSearchQuery = {
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { brand: regEx },
        { tags: regEx },
        { seasonal: regEx },
      ],
    };

    // Execute search query
    const searchResults = await Product.find(createSearchQuery);
    
    // If coordinates are provided, apply weather-based discounts
    let weatherData = null;
    let discountInfo = null;

    if (latitude && longitude) {
      try {
        weatherData = await getWeatherByCoordinates(parseFloat(latitude), parseFloat(longitude));
        if (weatherData) {
          discountInfo = calculateWeatherDiscount(weatherData);
        }
      } catch (error) {
        console.log("Weather service error in search:", error);
        // Continue without weather data
      }
    }
    
    // Apply discounts to eligible products based on weather
    const productsWithDiscount = searchResults.map(product => {
      const productObj = product.toObject();
      
      if (weatherData && discountInfo && productObj.weatherDiscountEligible) {
        // Apply weather-based discount
        let shouldApplyDiscount = true;
        
        // Apply seasonal filters
        if (weatherData.temperature >= 25 && productObj.seasonal === 'winter') {
          // Too hot for winter clothes
          shouldApplyDiscount = false;
        } else if (weatherData.temperature <= 15 && productObj.seasonal === 'summer') {
          // Too cold for summer clothes
          shouldApplyDiscount = false;
        } else if (productObj.seasonal === 'rainy' && 
                  !['Rain', 'Drizzle', 'Thunderstorm', 'Mist', 'Fog'].includes(weatherData.conditions)) {
          // Not rainy weather for rainy clothes
          shouldApplyDiscount = false;
        }
        
        // Increase discount percentage for seasonal matches
        let seasonalBoost = 0;
        if ((weatherData.temperature >= 25 && productObj.seasonal === 'summer') || 
            (weatherData.temperature <= 15 && productObj.seasonal === 'winter') ||
            (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherData.conditions) && productObj.seasonal === 'rainy')) {
          // Perfect season match - add bonus
          seasonalBoost = 10; // 10% additional discount for perfect season match
        }
        
        if (shouldApplyDiscount && (discountInfo.percentage > 0 || seasonalBoost > 0)) {
          const totalDiscount = Math.min(discountInfo.percentage + seasonalBoost, 50); // Cap at 50%
          
          productObj.weatherDiscount = {
            percentage: totalDiscount,
            reason: discountInfo.reason + (seasonalBoost > 0 ? ' + seasonal match bonus' : '')
          };
          
          // Calculate discounted price
          const discountAmount = (productObj.price * totalDiscount) / 100;
          productObj.weatherDiscountedPrice = Math.round((productObj.price - discountAmount) * 100) / 100;
        }
      }
      
      return productObj;
    });

    res.status(200).json({
      success: true,
      data: productsWithDiscount,
      weather: weatherData ? {
        temperature: weatherData.temperature,
        conditions: weatherData.conditions,
        location: weatherData.location,
        description: weatherData.description,
        icon: weatherData.icon
      } : null
    });
  } catch (error) {
    console.log("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while searching products",
      error: error.message
    });
  }
};

/**
 * Search products by specific category
 */
const searchByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { latitude, longitude } = req.query;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required"
      });
    }
    
    // Find products matching the category (case insensitive)
    const products = await Product.find({ 
      category: new RegExp(category, 'i')
    });
    
    // Handle weather discounts (same as in searchProducts)
    let weatherData = null;
    let discountInfo = null;

    if (latitude && longitude) {
      try {
        weatherData = await getWeatherByCoordinates(parseFloat(latitude), parseFloat(longitude));
        if (weatherData) {
          discountInfo = calculateWeatherDiscount(weatherData);
        }
      } catch (error) {
        console.log("Weather service error in category search:", error);
      }
    }
    
    // Apply discounts to eligible products
    const productsWithDiscount = products.map(product => {
      const productObj = product.toObject();
      
      if (weatherData && discountInfo && productObj.weatherDiscountEligible) {
        // Apply weather-based discount logic
        let shouldApplyDiscount = true;
        
        if (weatherData.temperature >= 25 && productObj.seasonal === 'winter') {
          shouldApplyDiscount = false;
        } else if (weatherData.temperature <= 15 && productObj.seasonal === 'summer') {
          shouldApplyDiscount = false;
        } else if (productObj.seasonal === 'rainy' && 
                  !['Rain', 'Drizzle', 'Thunderstorm', 'Mist', 'Fog'].includes(weatherData.conditions)) {
          shouldApplyDiscount = false;
        }
        
        let seasonalBoost = 0;
        if ((weatherData.temperature >= 25 && productObj.seasonal === 'summer') || 
            (weatherData.temperature <= 15 && productObj.seasonal === 'winter') ||
            (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherData.conditions) && productObj.seasonal === 'rainy')) {
          seasonalBoost = 10;
        }
        
        if (shouldApplyDiscount && (discountInfo.percentage > 0 || seasonalBoost > 0)) {
          const totalDiscount = Math.min(discountInfo.percentage + seasonalBoost, 50);
          
          productObj.weatherDiscount = {
            percentage: totalDiscount,
            reason: discountInfo.reason + (seasonalBoost > 0 ? ' + seasonal match bonus' : '')
          };
          
          const discountAmount = (productObj.price * totalDiscount) / 100;
          productObj.weatherDiscountedPrice = Math.round((productObj.price - discountAmount) * 100) / 100;
        }
      }
      
      return productObj;
    });
    
    res.status(200).json({
      success: true,
      data: productsWithDiscount,
      weather: weatherData ? {
        temperature: weatherData.temperature,
        conditions: weatherData.conditions,
        location: weatherData.location,
        description: weatherData.description,
        icon: weatherData.icon
      } : null
    });
  } catch (error) {
    console.log("Category search error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while searching by category",
      error: error.message
    });
  }
};

/**
 * Search products by brand
 */
const searchByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const { latitude, longitude } = req.query;
    
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand is required"
      });
    }
    
    // Find products matching the brand (case insensitive)
    const products = await Product.find({ 
      brand: new RegExp(brand, 'i')
    });
    
    // Handle weather discounts (same as in searchProducts)
    let weatherData = null;
    let discountInfo = null;

    if (latitude && longitude) {
      try {
        weatherData = await getWeatherByCoordinates(parseFloat(latitude), parseFloat(longitude));
        if (weatherData) {
          discountInfo = calculateWeatherDiscount(weatherData);
        }
      } catch (error) {
        console.log("Weather service error in brand search:", error);
      }
    }
    
    // Apply discounts to eligible products
    const productsWithDiscount = products.map(product => {
      const productObj = product.toObject();
      
      if (weatherData && discountInfo && productObj.weatherDiscountEligible) {
        // Apply weather-based discount logic
        let shouldApplyDiscount = true;
        
        if (weatherData.temperature >= 25 && productObj.seasonal === 'winter') {
          shouldApplyDiscount = false;
        } else if (weatherData.temperature <= 15 && productObj.seasonal === 'summer') {
          shouldApplyDiscount = false;
        } else if (productObj.seasonal === 'rainy' && 
                  !['Rain', 'Drizzle', 'Thunderstorm', 'Mist', 'Fog'].includes(weatherData.conditions)) {
          shouldApplyDiscount = false;
        }
        
        let seasonalBoost = 0;
        if ((weatherData.temperature >= 25 && productObj.seasonal === 'summer') || 
            (weatherData.temperature <= 15 && productObj.seasonal === 'winter') ||
            (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherData.conditions) && productObj.seasonal === 'rainy')) {
          seasonalBoost = 10;
        }
        
        if (shouldApplyDiscount && (discountInfo.percentage > 0 || seasonalBoost > 0)) {
          const totalDiscount = Math.min(discountInfo.percentage + seasonalBoost, 50);
          
          productObj.weatherDiscount = {
            percentage: totalDiscount,
            reason: discountInfo.reason + (seasonalBoost > 0 ? ' + seasonal match bonus' : '')
          };
          
          const discountAmount = (productObj.price * totalDiscount) / 100;
          productObj.weatherDiscountedPrice = Math.round((productObj.price - discountAmount) * 100) / 100;
        }
      }
      
      return productObj;
    });
    
    res.status(200).json({
      success: true,
      data: productsWithDiscount,
      weather: weatherData ? {
        temperature: weatherData.temperature,
        conditions: weatherData.conditions,
        location: weatherData.location,
        description: weatherData.description,
        icon: weatherData.icon
      } : null
    });
  } catch (error) {
    console.log("Brand search error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while searching by brand",
      error: error.message
    });
  }
};

module.exports = { 
  searchProducts,
  searchByCategory,
  searchByBrand
};
