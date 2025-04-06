const express = require("express");
const { getWeatherDiscount } = require("../../controllers/shop/discount-controller");

const router = express.Router();

router.post("/weather", getWeatherDiscount);

module.exports = router; 