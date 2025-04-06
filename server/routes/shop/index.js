const express = require("express");
const router = express.Router();

// Import sub-routes
const productRoutes = require("./products-routes");
const cartRoutes = require("./cart-routes");
const orderRoutes = require("./order-routes");
const addressRoutes = require("./address-routes");
const searchRoutes = require("./search-routes");
const reviewRoutes = require("./review-routes");
const discountRoutes = require("./discount-routes");

// Import recommendation controller
const {
  trackProductView, 
  trackSearchQuery, 
  getRecommendations, 
  getSimilarProducts
} = require('../../controllers/shop/recommendation-controller');

// Define sub-routes
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/address", addressRoutes);
router.use("/search", searchRoutes);
router.use("/review", reviewRoutes);
router.use("/discount", discountRoutes);

// Add recommendation routes
router.post('/recommendation/track-view', trackProductView);
router.post('/recommendation/track-search', trackSearchQuery);
router.get('/recommendation/user/:userId', getRecommendations);
router.get('/recommendation/trending', (req, res) => {
  // Redirect to getRecommendations with a special flag for trending
  req.params.userId = 'trending';
  getRecommendations(req, res);
});
router.get('/recommendation/similar/:productId', getSimilarProducts);

module.exports = router; 