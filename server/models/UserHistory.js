const mongoose = require("mongoose");

const UserHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    viewedProducts: [
      {
        productId: String,
        viewCount: Number, 
        lastViewedAt: Date,
      }
    ],
    purchasedProducts: [
      {
        productId: String,
        purchaseCount: Number,
        lastPurchasedAt: Date,
      }
    ],
    searchQueries: [
      {
        query: String,
        timestamp: Date,
      }
    ],
    seasonalPreferences: {
      summer: { type: Number, default: 0 },
      rainy: { type: Number, default: 0 },
      winter: { type: Number, default: 0 }
    },
    categoryPreferences: {
      men: { type: Number, default: 0 },
      women: { type: Number, default: 0 },
      kids: { type: Number, default: 0 },
      accessories: { type: Number, default: 0 },
      footwear: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserHistory", UserHistorySchema); 