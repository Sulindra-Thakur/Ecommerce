const Product = require("../../models/Product");
const { calculateWeatherDiscount, getWeatherByCoordinates } = require("../../helpers/weatherService");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], seasonal = [], tags = [], sortBy = "price-lowtohigh" } = req.query;
    const { latitude, longitude } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }
    
    if (seasonal.length) {
      filters.seasonal = { $in: seasonal.split(",") };
    }
    
    if (tags.length) {
      const tagsList = tags.split(",");
      filters.tags = { $in: tagsList };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    const products = await Product.find(filters).sort(sort);

    // If latitude and longitude are provided, apply weather-based discounts
    let weatherData = null;
    let discountInfo = null;

    if (latitude && longitude) {
      try {
        weatherData = await getWeatherByCoordinates(parseFloat(latitude), parseFloat(longitude));
        discountInfo = calculateWeatherDiscount(weatherData);
      } catch (error) {
        console.log("Weather service error:", error);
        // Continue without weather data
      }
    }

    // Apply discounts to eligible products based on weather
    const productsWithDiscount = products.map(product => {
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
        description: weatherData.description
      } : null
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.query;
    
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    // Convert to object to add additional properties
    const productObj = product.toObject();

    // If latitude and longitude are provided, apply weather-based discounts
    let weatherData = null;
    let discountInfo = null;

    if (latitude && longitude) {
      try {
        weatherData = await getWeatherByCoordinates(parseFloat(latitude), parseFloat(longitude));
        discountInfo = calculateWeatherDiscount(weatherData);
      } catch (error) {
        console.log("Weather service error:", error);
        // Continue without weather data
      }
    }

    // Apply weather discount if eligible
    if (weatherData && discountInfo && productObj.weatherDiscountEligible) {
      // Apply seasonal filters
      let shouldApplyDiscount = true;
      
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

    res.status(200).json({
      success: true,
      data: productObj,
      weather: weatherData ? {
        temperature: weatherData.temperature,
        conditions: weatherData.conditions,
        location: weatherData.location,
        description: weatherData.description
      } : null
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
