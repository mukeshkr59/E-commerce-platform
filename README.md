# E-commerce Platform

A modern full-stack e-commerce platform built with React.js and Node.js.

![Frontend Preview](/path/to/your/image.png)

## 📸 Screenshots
![Home Page](/Screenshots/home.png)
*Home Page View*

![Shopping Cart](/screenshots/cart.png)
*Shopping Cart View*

![checkout Details](/screenshots/checkout.png)
*checkout Details View*

![receipt  Details](/screenshots/receipt.png)
*receipt  Details View*




## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## ✨ Features

- User-friendly product browsing and searching
- Shopping cart functionality
- Secure checkout process
- Product management system
- Responsive design for all devices

## 🛠 Tech Stack

### Frontend:

- React.js
- Vite
- Tailwind CSS
- ESLint for code quality

### Backend:

- Node.js
- Express.js
- MongoDB (with Mongoose)
- RESTful API architecture

## 📁 Project Structure

```
Backend/
    ├── models/         # Database models
    ├── routes/         # API routes
    └── server.js       # Server configuration

Frontend/
    ├── public/         # Static files
    ├── src/
    │   ├── assets/     # Images and resources
    │   ├── App.jsx     # Main application component
    │   └── main.jsx    # Entry point
    └── index.html      # HTML template
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm 
- MongoDB
- Git

### Initial Setup

1. Clone the repository:

```bash
git clone https://github.com/mukeshkr59/E-commerce-platform.git
cd E-commerce-platform
```

2. Set up Backend:

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create environment file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development" > .env

# Initialize database (if needed)
npm run seed  # If you have a seed script
```

3. Set up Frontend:

```bash
# Navigate to frontend directory
cd ../Frontend

# Install dependencies
npm install

# Create environment file (if needed)
echo "VITE_API_URL=http://localhost:5000/api
VITE_ENV=development" > .env
```

### Database Setup

1. Install MongoDB:

   - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Follow the installation instructions for your OS
   - Start MongoDB service

2. Create database:

```bash
# Start MongoDB shell
mongosh

# Create and use database
use ecommerce
```

### Starting the Application

1. Start Backend Server:

```bash
# In Backend directory
npm run dev

# Expected output:
# Server running on port 5000
# Connected to MongoDB successfully
```

2. Start Frontend Development Server:

```bash
# In Frontend directory
npm run dev

# Expected output:
# Local:   http://localhost:5173/
# Network: http://192.168.x.x:5173/
```

3. Access the Application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

### Common Issues and Solutions

1. MongoDB Connection Issues:

   - Ensure MongoDB service is running
   - Check MongoDB connection string in `.env`
   - Verify network connectivity

2. Port Conflicts:

   - If port 5000 is occupied, modify PORT in backend `.env`
   - If port 5173 is occupied, Vite will automatically suggest next available port

3. Dependencies Issues:

   ```bash
   # Clear npm cache
   npm cache clean --force

   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

## 🔥 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart

- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/checkout` - Create new order
- `GET /api/orders/:id` - Get order details


---

Developed with ❤️ by [mukeshkr59](https://github.com/mukeshkr59)
