const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/checkout - Process checkout
router.post('/', async (req, res) => {
  try {
    const { customer, cartItems, userId = 'guest' } = req.body;

    // Validate customer info
    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({ 
        error: 'Customer name and email are required' 
      });
    }

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        error: 'Cart is empty' 
      });
    }

    // Verify stock availability and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.id || item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          error: `Product ${item.id || item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}` 
        });
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save();

      // Add to order items
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      total += product.price * item.quantity;
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = new Order({
      orderId,
      customer: {
        name: customer.name,
        email: customer.email
      },
      items: orderItems,
      total,
      status: 'confirmed'
    });

    await order.save();

    // Clear user's cart
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.total = 0;
      await cart.save();
    }

    // Return receipt
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      receipt: {
        orderId: order.orderId,
        customer: order.customer,
        items: order.items,
        total: order.total,
        status: order.status,
        timestamp: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ 
      error: 'Failed to process checkout', 
      message: error.message 
    });
  }
});

// GET /api/checkout/orders - Get all orders (Admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      message: error.message 
    });
  }
});

// GET /api/checkout/orders/:orderId - Get specific order
router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order', 
      message: error.message 
    });
  }
});

module.exports = router;