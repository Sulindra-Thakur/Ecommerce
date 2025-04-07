# MERN E-Commerce with Weather-Based Smart Discounts

A full-featured e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) that includes a unique weather-based smart discount system.

## Features

- **User Authentication**: Register, login, and profile management
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add, update, and remove items
- **Checkout Process**: Address management and payment integration
- **Order History**: Track past orders and their status
- **Admin Dashboard**: Manage products, orders, and users
- **Weather-Based Smart Discounts**: Dynamic discounts based on local weather conditions

## Weather-Based Smart Discount System

The platform includes a unique feature that applies automatic discounts based on the customer's local weather conditions:

- **Geolocation**: Uses the browser's geolocation API to determine the user's location
- **Weather API Integration**: Fetches real-time weather data based on coordinates
- **Conditional Discounts**: Applies different discount percentages based on:
  - **Temperature**: Special discounts for very hot or cold days
  - **Weather Conditions**: Rain, snow, thunderstorms trigger different discount levels
  - **Seasonal Products**: Intelligently applies discounts (e.g., winter products discounted on hot days)
- **Visual Indicators**: Weather condition banner and product-specific discount badges
- **Transparent Pricing**: Shows original and discounted prices with weather discount reason

## Setup and Configuration

### Prerequisites
- Node.js and npm
- MongoDB
- OpenWeatherMap API key

### Environment Variables
Create a `.env` file in the server directory with the following:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
WEATHER_API_KEY=your_openweathermap_api_key
```

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/mern-ecommerce-2024.git
cd mern-ecommerce-2024
```

2. Install server dependencies
```
cd server
npm install
```

3. Install client dependencies
```
cd ../client
npm install
```

4. Run the development servers
```
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

5. Access the application at `http://localhost:5173`

## Technical Implementation

The weather-based discount system is implemented using:

- **Frontend**:
  - React context API for sharing location and weather data
  - Custom hooks for geolocation
  - Redux for state management with weather information
  - Tailwind CSS for weather-related UI components

- **Backend**:
  - Node.js with Express for API routing
  - External weather API integration
  - Discount calculation algorithms based on weather conditions
  - Product model with seasonal attributes

## License
MIT 