const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    
    // If no products exist, seed with mock data
    if (products.length === 0) {
      const mockProducts = [
        {
          name: "Wireless Bluetooth Headphones",
          price: 79.99,
          description: "High-quality wireless headphones with noise cancellation",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          category: "electronics",
          stock: 50
        },
        {
          name: "Smart Watch Pro",
          price: 299.99,
          description: "Advanced fitness tracking and notifications",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          category: "electronics",
          stock: 30
        },
        {
          name: "Leather Backpack",
          price: 89.99,
          description: "Stylish and durable leather backpack",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
          category: "accessories",
          stock: 75
        },
        {
          name: "Running Shoes",
          price: 129.99,
          description: "Comfortable running shoes for all terrains",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
          category: "footwear",
          stock: 100
        },
        {
          name: "Stainless Steel Water Bottle",
          price: 24.99,
          description: "Insulated water bottle keeps drinks cold for 24 hours",
          image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
          category: "accessories",
          stock: 200
        },
        {
          name: "Wireless Mouse",
          price: 39.99,
          description: "Ergonomic wireless mouse with USB receiver",
          image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
          category: "electronics",
          stock: 150
        },
        {
          name: "Sunglasses",
          price: 149.99,
          description: "UV protection designer sunglasses",
          image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
          category: "accessories",
          stock: 60
        },
        {
          name: "Yoga Mat",
          price: 34.99,
          description: "Non-slip yoga mat with carrying strap",
          image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
          category: "fitness",
          stock: 80
        }
      ];

      await Product.insertMany(mockProducts);
      const seededProducts = await Product.find();
      return res.json(seededProducts);
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product', message: error.message });
  }
});

// POST /api/products - Create new product (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      stock
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

module.exports = router;