# MERN E-commerce Application (2024)

## Deployment to Render.com

This application is configured for easy deployment on Render.com. Follow these steps to deploy:

### Prerequisites

1. A Render.com account (free tier works)
2. A MongoDB Atlas account for the database
3. PayPal Developer account for payment processing

### Setup MongoDB Atlas

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write privileges
4. Whitelist access from anywhere (for Render deployment)
5. Get your MongoDB connection string (replace `<password>` with your database user's password)

### Setup Environment Variables

#### Server Environment Variables
Create a `.env` file in the server directory with the following (do not commit this file):

```
# Server Configuration
PORT=5002
NODE_ENV=production

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
```

#### Client Environment Variables
Create a `.env` file in the client directory (do not commit this file):

```
VITE_API_URL=https://your-backend-api.onrender.com
```

### Deploy to Render

#### Option 1: Using Blueprint (Recommended)

1. Push your project to GitHub
2. Log into Render.com
3. Click "New" and select "Blueprint"
4. Connect your GitHub repository
5. Render will detect the `render.yaml` file and create both services
6. Add your secret environment variables in the Render dashboard for each service
7. Deploy the services

#### Option 2: Manual Deployment

##### Deploy the Backend:
1. In Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: `mern-ecommerce-api`
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. Add Environment Variables:
   - `PORT`: 5002
   - `NODE_ENV`: production
   - `MONGODB_URI`: your MongoDB connection string
   - `JWT_SECRET`: generate a secure random string
   - `PAYPAL_CLIENT_ID`: from your PayPal developer account
   - `PAYPAL_CLIENT_SECRET`: from your PayPal developer account
5. Click "Create Web Service"

##### Deploy the Frontend:
1. In Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: `mern-ecommerce-frontend`
   - Environment: `Node`
   - Region: Same as your backend
   - Branch: `main`
   - Build Command: `cd client && npm install && npm run build`
   - Start Command: `cd client && npm run preview`
4. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g., https://mern-ecommerce-api.onrender.com)
5. Click "Create Web Service"

### After Deployment

1. Add the frontend URL to the backend's `ALLOWED_ORIGINS` environment variable
2. Update the PayPal redirect URLs in the order controller
3. Test the entire application flow, especially user authentication and payments

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
3. Setup environment variables using the `.env.example` files
4. Start development servers:
   ```bash
   # In the root directory
   npm run dev
   ```

## Features

- User authentication and authorization
- Product browsing and searching
- Shopping cart functionality
- Checkout with PayPal integration
- Order history and tracking
- AI-powered product recommendations
- Responsive design for mobile and desktop
- Weather-based product recommendations

## License
MIT 