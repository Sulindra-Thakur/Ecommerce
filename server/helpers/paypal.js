const paypal = require("paypal-rest-sdk");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Determine PayPal mode based on environment
const mode = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox';

// PayPal configuration
paypal.configure({
  mode: process.env.PAYPAL_MODE || mode,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Log PayPal configuration status without exposing credentials
console.log(`PayPal configured in ${mode} mode`);

module.exports = paypal;
