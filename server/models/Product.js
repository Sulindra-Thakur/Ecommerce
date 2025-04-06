const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    seasonal: {
      type: String,
      enum: ["summer", "rainy", "winter", "all"],
      default: "all"
    },
    tags: [String],
    weatherDiscountEligible: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
