# How to Run the MERN E-Commerce Application with Weather-Based Discounts

Follow these steps to run the application:

## Step 1: Start the Backend Server

1. Open a command prompt or PowerShell window
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Start the server:
   ```
   npm run dev
   ```
4. You should see the message: "Server is now running on port 5001" and "MongoDB connected"

## Step 2: Start the Frontend Client

1. Open a second command prompt or PowerShell window
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Start the client:
   ```
   npm run dev
   ```
4. The client should start on port 5173

## Step 3: Access the Application

1. Open your browser and go to: http://localhost:5173
2. When prompted, allow location access to enable the weather-based discount feature
3. Log in with your credentials

## Troubleshooting

If you encounter any issues:

1. Make sure the server is running on port 5001
2. Check if there are any error messages in the terminal
3. Clear your browser cache and try again
4. Make sure you've installed all dependencies with `npm install` in both server and client directories

## Weather-Based Discount Feature

This application includes a weather-based discount system that:

1. Uses your location to fetch local weather data
2. Applies dynamic discounts based on weather conditions
3. Shows special pricing for products with weather discounts
4. Displays a weather discount banner when applicable 