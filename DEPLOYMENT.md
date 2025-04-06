# Deployment Guide for MERN E-Commerce on Render

This guide provides step-by-step instructions for deploying this MERN E-Commerce application to Render.com.

## Prerequisites

- Node.js (v18.x recommended)
- MongoDB Atlas account
- Git repository with your code

## ⚠️ IMPORTANT: Sensitive Information Warning

Never commit sensitive information such as:
- Database credentials
- API keys
- JWT secrets
- Passwords

These should be set as environment variables in your hosting platform and not stored in your code repository.

## Environment Configuration

You need to set up these environment variables for production:

### Server Environment Variables
- `NODE_ENV`: Set to "production"
- `PORT`: The port your server will run on (Render will override this with its own port)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `WEATHER_API_KEY`: Your OpenWeatherMap API key

### Client Environment Variables
- `VITE_API_URL`: URL of your backend API

## Deployment to Render.com

Render provides an easy way to deploy full-stack applications with automatic CI/CD.

### Steps:

1. **Create a Render account**: 
   - Sign up at https://render.com

2. **Connect your Git repository**: 
   - In the Render dashboard, go to "Blueprints" and click "New Blueprint Instance"
   - Connect your GitHub/GitLab repository 
   - If you don't want to use Blueprints, you can create a Web Service directly

3. **Create a Web Service**:
   - Click "New" and select "Web Service"
   - Connect your repository
   - Configure your web service:
     - Name: `mern-ecommerce-app` (or your preferred name)
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Plan: Select the appropriate plan (Free tier is available)

4. **Set Environment Variables**:
   - In the Render dashboard, go to your web service
   - Click "Environment" tab
   - Add the following environment variables:
     - `NODE_ENV`: `production`
     - `PORT`: `5002` (Render will override this with its own port)
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string
     - `ALLOWED_ORIGINS`: Your Render app URL (e.g., `https://mern-ecommerce-app.onrender.com`)
     - `WEATHER_API_KEY`: Your OpenWeatherMap API key

5. **Deploy**:
   - Render will automatically deploy your application when you push changes to your repository
   - Initial deployment may take a few minutes

6. **Update CORS Settings After Deployment**:
   - After deployment, update the `ALLOWED_ORIGINS` environment variable to include your actual Render URL
   - This is important for proper CORS configuration

7. **Access Your Application**:
   - Once deployed, you can access your application at the URL provided by Render

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Make sure `ALLOWED_ORIGINS` in your server configuration includes your client URL
   - Check that your client is making requests to the correct API URL

2. **MongoDB Connection Issues**:
   - Verify your MongoDB connection string is correct
   - Ensure your IP address is whitelisted in MongoDB Atlas

3. **Build Failures**:
   - Check your build logs for specific errors
   - Make sure all dependencies are correctly installed

4. **"Not Found" Errors for Client Routes**:
   - Ensure the server.js file is correctly configured to serve the React app for all non-API routes

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the logs in the Render dashboard
2. Review the application documentation
3. Search for the specific error message online 