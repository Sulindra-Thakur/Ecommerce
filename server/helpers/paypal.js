const paypal = require("paypal-rest-sdk");

// PayPal sandbox configuration
paypal.configure({
  mode: "sandbox", // sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID || "AcNP13L2jnjjv_3lrwQa8DpEB9V9KVrSW3zwMIL6C2DhzZI2FSOXwipo2a3ThhUSkQ3RtSMiedSbBT92",
  client_secret: process.env.PAYPAL_CLIENT_SECRET || "EEiQruYEblC4eNtryvYNa9dV_XZUS52CfdiYTgXVQnNMGhy3JzvfeNpRPGM-VGxngIyMwrItey2wt5Wb",
});

module.exports = paypal;
