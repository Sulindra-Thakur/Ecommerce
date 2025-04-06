const Product = require("../../models/Product");
const UserHistory = require("../../models/UserHistory");

// Track user product view
const trackProductView = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    // Get product details to update preferences
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find or create user history
    let userHistory = await UserHistory.findOne({ userId });
    
    if (!userHistory) {
      userHistory = new UserHistory({
        userId,
        viewedProducts: [],
        purchasedProducts: [],
        searchQueries: [],
      });
    }

    // Update viewed products
    const existingProductIndex = userHistory.viewedProducts.findIndex(
      (item) => item.productId === productId
    );

    if (existingProductIndex !== -1) {
      // Product already exists in history, update count and timestamp
      userHistory.viewedProducts[existingProductIndex].viewCount += 1;
      userHistory.viewedProducts[existingProductIndex].lastViewedAt = new Date();
    } else {
      // Add new product to history
      userHistory.viewedProducts.push({
        productId,
        viewCount: 1,
        lastViewedAt: new Date(),
      });
    }

    // Update category preferences
    if (product.category) {
      const category = product.category.toLowerCase();
      if (userHistory.categoryPreferences[category] !== undefined) {
        userHistory.categoryPreferences[category] += 1;
      }
    }

    // Update seasonal preferences
    if (product.seasonal && product.seasonal !== 'all') {
      const season = product.seasonal.toLowerCase();
      if (userHistory.seasonalPreferences[season] !== undefined) {
        userHistory.seasonalPreferences[season] += 1;
      }
    }

    // Save user history
    await userHistory.save();

    res.status(200).json({
      success: true,
      message: "Product view tracked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error tracking product view",
    });
  }
};

// Track search query
const trackSearchQuery = async (req, res) => {
  try {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
      return res.status(400).json({
        success: false,
        message: "User ID and search query are required",
      });
    }

    // Find or create user history
    let userHistory = await UserHistory.findOne({ userId });
    
    if (!userHistory) {
      userHistory = new UserHistory({
        userId,
        viewedProducts: [],
        purchasedProducts: [],
        searchQueries: [],
      });
    }

    // Add search query to history
    userHistory.searchQueries.push({
      query,
      timestamp: new Date(),
    });

    // Limit search history to last 20 searches
    if (userHistory.searchQueries.length > 20) {
      userHistory.searchQueries = userHistory.searchQueries.slice(-20);
    }

    // Save user history
    await userHistory.save();

    res.status(200).json({
      success: true,
      message: "Search query tracked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error tracking search query",
    });
  }
};

// Get personalized recommendations
const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 8, weatherData } = req.query;
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      // Return trending products if no userId is provided
      const trendingProducts = await Product.find({})
        .sort({ averageReview: -1 })
        .limit(parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: trendingProducts,
        recommendationType: "trending",
      });
    }

    // Find user history
    const userHistory = await UserHistory.findOne({ userId });
    
    if (!userHistory) {
      // If no history, return trending products
      const trendingProducts = await Product.find({})
        .sort({ averageReview: -1 })
        .limit(parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: trendingProducts,
        recommendationType: "trending",
      });
    }

    // Determine user preferences
    const preferredCategories = Object.entries(userHistory.categoryPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([category]) => category);
    
    const preferredSeasons = Object.entries(userHistory.seasonalPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Get recently viewed product IDs
    const recentlyViewedIds = userHistory.viewedProducts
      .sort((a, b) => new Date(b.lastViewedAt) - new Date(a.lastViewedAt))
      .slice(0, 5)
      .map(item => item.productId);

    // Get purchased product IDs
    const purchasedProductIds = userHistory.purchasedProducts
      .map(item => item.productId);
    
    // Build query for recommendations
    let recommendationQuery = {};
    
    // Consider weather if available
    if (weatherData) {
      const parsedWeather = typeof weatherData === 'string' ? JSON.parse(weatherData) : weatherData;
      const temperature = parsedWeather.temperature || parsedWeather.main?.temp;
      
      // Add weather-based recommendations
      if (temperature >= 25) {
        preferredSeasons.push('summer');
      } else if (temperature <= 15) {
        preferredSeasons.push('winter');
      } else {
        preferredSeasons.push('rainy');
      }
    }
    
    // Create query with user preferences
    if (preferredCategories.length > 0 || preferredSeasons.length > 0) {
      recommendationQuery.$or = [];
      
      if (preferredCategories.length > 0) {
        recommendationQuery.$or.push({ 
          category: { $in: preferredCategories } 
        });
      }
      
      if (preferredSeasons.length > 0) {
        recommendationQuery.$or.push({ 
          seasonal: { $in: preferredSeasons } 
        });
        recommendationQuery.$or.push({ 
          tags: { $in: preferredSeasons } 
        });
      }
    }
    
    // Exclude recently viewed products but prioritize similar items to purchases
    const excludedIds = [...recentlyViewedIds];
    
    // Don't exclude purchased products, as we want to recommend similar items
    // But we'll exclude the exact same products later
    
    if (excludedIds.length > 0) {
      recommendationQuery._id = { $nin: excludedIds };
    }
    
    // Special handling for footwear recommendations if user purchased shoes
    const hasPurchasedFootwear = userHistory.categoryPreferences.footwear > 0;
    if (hasPurchasedFootwear) {
      // If the user has purchased footwear, make sure we include more footwear recommendations
      if (!recommendationQuery.$or) {
        recommendationQuery.$or = [];
      }
      recommendationQuery.$or.push({ category: "footwear" });
    }
    
    // Get personalized recommendations
    let recommendedProducts = await Product.find(recommendationQuery)
      .sort({ averageReview: -1 })
      .limit(parseInt(limit) + purchasedProductIds.length); // Get extra in case we need to filter out purchased items
    
    // Remove exact purchased products from recommendations if they're included
    // (but we still want similar products to show up)
    if (purchasedProductIds.length > 0) {
      recommendedProducts = recommendedProducts.filter(
        product => !purchasedProductIds.includes(product._id.toString())
      );
    }
    
    // Take only the requested limit
    recommendedProducts = recommendedProducts.slice(0, parseInt(limit));
    
    // If not enough recommendations, get popular products
    if (recommendedProducts.length < parseInt(limit)) {
      const additionalCount = parseInt(limit) - recommendedProducts.length;
      
      // Get IDs of already recommended products
      const recommendedIds = recommendedProducts.map(product => product._id.toString());
      
      // Query for additional popular products not already included
      const additionalProducts = await Product.find({
        _id: { $nin: [...excludedIds, ...recommendedIds, ...purchasedProductIds] }
      })
        .sort({ averageReview: -1 })
        .limit(additionalCount);
      
      // Combine results
      recommendedProducts.push(...additionalProducts);
    }
    
    res.status(200).json({
      success: true,
      data: recommendedProducts,
      recommendationType: "personalized",
      preferences: {
        categories: preferredCategories,
        seasons: preferredSeasons
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error getting recommendations",
    });
  }
};

// Get similar products based on a specific product
const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Build query for similar products
    const similarQuery = {
      _id: { $ne: productId },
      $or: []
    };
    
    // Match by category
    if (product.category) {
      similarQuery.$or.push({ category: product.category });
    }
    
    // Match by seasonal attribute
    if (product.seasonal && product.seasonal !== 'all') {
      similarQuery.$or.push({ seasonal: product.seasonal });
    }
    
    // Match by tags
    if (product.tags && product.tags.length > 0) {
      similarQuery.$or.push({ tags: { $in: product.tags } });
    }
    
    // Match by brand
    if (product.brand) {
      similarQuery.$or.push({ brand: product.brand });
    }
    
    // Get similar products
    const similarProducts = await Product.find(similarQuery)
      .sort({ averageReview: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: similarProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error getting similar products",
    });
  }
};

module.exports = {
  trackProductView,
  trackSearchQuery,
  getRecommendations,
  getSimilarProducts
}; 