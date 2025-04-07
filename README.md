# MERN E-commerce Application

A full-featured e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js) featuring weather-based discounts and AI recommendations.

## Features

- User authentication and authorization
- Product catalog with search and filter functionality
- Shopping cart and checkout process
- PayPal payment integration
- Order history and tracking
- Admin dashboard for product and order management
- Weather-based discount system
- AI-powered product recommendations
- Real-time notifications

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- PayPal Developer Account for payment processing
- OpenWeatherMap API key for weather-based discounts
- OpenAI API key for AI recommendations

## Project Structure

```
mern-ecommerce-2024/
├── client/             # React frontend
├── server/             # Express backend
└── package.json        # Root package.json for scripts
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mern-ecommerce-2024
   ```

2. Install dependencies for the client, server, and root:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory with the following variables:
     ```
     PORT=5002
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PAYPAL_CLIENT_ID=your_paypal_client_id
     PAYPAL_CLIENT_SECRET=your_paypal_client_secret
     OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
     OPENAI_API_KEY=your_openai_api_key
     NODE_ENV=development
     ```

## Running the Application

### Development Mode

To run both the client and server in development mode:
```
npm run dev
```

To run the server and client separately:
```
npm run dev:server
npm run dev:client
```

### Production Mode

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Deployment

This application is configured for deployment on platforms like Render.

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your repository
3. Configure the service:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add environment variables

## API Documentation

The API endpoints are documented using Swagger UI, which can be accessed at:
```
http://localhost:5002/api-docs
```

## License

This project is licensed under the ISC License. 