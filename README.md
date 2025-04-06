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

## Deployment

This project is configured for easy deployment to Render.com. We've prepared detailed deployment instructions in the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

### Quick Deployment Steps

1. Create an account on [Render.com](https://render.com)
2. Connect your Git repository
3. Set up a new Web Service with:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Configure the required environment variables
5. Deploy!

⚠️ **IMPORTANT**: Never commit sensitive information (API keys, database credentials, etc.) to your repository. Use environment variables on Render.com instead.

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Deployment Guide

### Prerequisites
- Node.js (v18.x recommended)
- MongoDB account
- Heroku account or other hosting service

### Local Development
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mern-ecommerce-2024.git
   cd mern-ecommerce-2024
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory based on the `.env.production` template
   - Create a `.env` file in the client directory with the correct API URL

4. Run development servers:
   ```
   npm run dev
   ```

### Deployment to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku:
   ```
   heroku login
   ```

3. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

4. Add MongoDB Atlas connection:
   ```
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   ```

5. Set other environment variables:
   ```
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com
   ```

6. Deploy to Heroku:
   ```
   git push heroku main
   ```

### Deployment to Render.com

1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables in the Render dashboard
7. Deploy your application

### Deployment to Vercel

#### Frontend (Client)
1. Create a Vercel account
2. Import your GitHub repository
3. Set up the project:
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in the Vercel dashboard
5. Deploy

#### Backend (Server)
1. Create a new project for the backend
2. Set up the project:
   - Root directory: `server`
   - Build command: (none)
   - Start command: `npm start`
3. Add environment variables in the Vercel dashboard
4. Deploy

### Important Deployment Notes

1. Update the client's API URL in `client/.env.production` to point to your deployed server
2. Update CORS settings in `server/.env.production` to allow your client domain
3. Make sure MongoDB connection is properly configured
4. Ensure PayPal integration URLs are updated for production
5. Update any other environment-specific settings 