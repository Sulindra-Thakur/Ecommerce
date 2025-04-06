const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const { getWeatherByCoordinates, calculateWeatherDiscount } = require("../../helpers/weatherService");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      cart.items[findCurrentProductIndex].quantity += quantity;
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.query;
    
    // Check if userId is undefined, null, an object, or invalid string
    if (!userId || userId === 'undefined' || userId === 'null' || userId === '[object Object]' || typeof userId !== 'string') {
      return res.status(200).json({
        success: true,
        data: { items: [] },
      });
    }

    // Proceed with DB query only if userId exists and is valid
    try {
      const cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        select: "image title price salePrice seasonal weatherDiscountEligible tags",
      });

      if (!cart) {
        return res.status(200).json({
          success: true,
          data: { items: [] },
        });
      }

      const validItems = cart.items.filter(
        (productItem) => productItem.productId
      );
      
      if (validItems.length < cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }

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

      const populateCartItems = validItems.map((item) => {
        const cartItem = {
          productId: item.productId._id,
          image: item.productId.image,
          title: item.productId.title,
          price: item.productId.price,
          salePrice: item.productId.salePrice,
          seasonal: item.productId.seasonal,
          tags: item.productId.tags,
          quantity: item.quantity,
        };
        
        // Apply weather discount if eligible
        if (weatherData && discountInfo && item.productId.weatherDiscountEligible) {
          // Apply seasonal filters
          let shouldApplyDiscount = true;
          
          if (weatherData.temperature >= 25 && item.productId.seasonal === 'winter') {
            // Too hot for winter clothes
            shouldApplyDiscount = false;
          } else if (weatherData.temperature <= 15 && item.productId.seasonal === 'summer') {
            // Too cold for summer clothes
            shouldApplyDiscount = false;
          } else if (item.productId.seasonal === 'rainy' && 
                    !['Rain', 'Drizzle', 'Thunderstorm', 'Mist', 'Fog'].includes(weatherData.conditions)) {
            // Not rainy weather for rainy clothes
            shouldApplyDiscount = false;
          }
          
          // Increase discount percentage for seasonal matches
          let seasonalBoost = 0;
          if ((weatherData.temperature >= 25 && item.productId.seasonal === 'summer') || 
              (weatherData.temperature <= 15 && item.productId.seasonal === 'winter') ||
              (['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherData.conditions) && item.productId.seasonal === 'rainy')) {
            // Perfect season match - add bonus
            seasonalBoost = 10; // 10% additional discount for perfect season match
          }
          
          if (shouldApplyDiscount && (discountInfo.percentage > 0 || seasonalBoost > 0)) {
            const totalDiscount = Math.min(discountInfo.percentage + seasonalBoost, 50); // Cap at 50%
            
            cartItem.weatherDiscount = {
              percentage: totalDiscount,
              reason: discountInfo.reason + (seasonalBoost > 0 ? ' + seasonal match bonus' : '')
            };
            
            // Calculate discounted price
            const discountAmount = (cartItem.price * totalDiscount) / 100;
            cartItem.weatherDiscountedPrice = Math.round((cartItem.price - discountAmount) * 100) / 100;
          }
        }
        
        return cartItem;
      });

      res.status(200).json({
        success: true,
        data: {
          ...cart._doc,
          items: populateCartItems,
          weather: weatherData ? {
            temperature: weatherData.temperature,
            conditions: weatherData.conditions,
            location: weatherData.location,
            description: weatherData.description
          } : null
        },
      });
    } catch (dbError) {
      console.log("Database error:", dbError);
      // If there's a DB error (like invalid ObjectId), return empty cart
      return res.status(200).json({
        success: true,
        data: { items: [] }
      });
    }
  } catch (error) {
    console.log("General error in fetchCartItems:", error);
    res.status(200).json({
      success: true,
      data: { items: [] },
      error: error.message
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Validate parameters
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }
    
    // Handle special case where userId might be "clear"
    if (userId === 'clear' || userId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
    });
  }
};

/**
 * Clear all items from user's cart after successful checkout
 */
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId - make sure it's a valid MongoDB ObjectId
    if (!userId || userId === 'clear' || userId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart already empty",
        data: { items: [] }
      });
    }

    // Empty the cart items
    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { items: [] }
    });
  } catch (error) {
    console.log("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  clearCart,
};
