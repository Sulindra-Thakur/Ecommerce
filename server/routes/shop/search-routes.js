const express = require("express");

const { 
  searchProducts,
  searchByCategory,
  searchByBrand 
} = require("../../controllers/shop/search-controller");

const router = express.Router();

// Specific routes first
router.get("/category/:category", searchByCategory);
router.get("/brand/:brand", searchByBrand);

// General search endpoint (must be last to avoid conflicts)
router.get("/:keyword", searchProducts);

module.exports = router;
