import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Check, X, AlertCircle } from 'lucide-react';

// we can switch between Fake Store API and my backend API
const USE_BACKEND = true;
const API_BASE = USE_BACKEND ? 'http://localhost:5000/api' : 'https://fakestoreapi.com';

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchProducts();
    if (USE_BACKEND) {
      fetchCart();
    } else {
      loadCartFromStorage();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = USE_BACKEND ? `${API_BASE}/products` : `${API_BASE}/products?limit=8`;
      const res = await fetch(endpoint);
      
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please refresh the page.');
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!USE_BACKEND) return;
    
    try {
      const res = await fetch(`${API_BASE}/cart?userId=guest`);
      if (!res.ok) throw new Error('Failed to fetch cart');
      
      const data = await res.json();
      setCart(data.items || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const loadCartFromStorage = () => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  };

  const saveCartToStorage = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = async (product) => {
    if (USE_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product._id || product.id,
            quantity: 1,
            userId: 'guest'
          })
        });
        
        if (!res.ok) throw new Error('Failed to add to cart');
        
        const data = await res.json();
        setCart(data.items || []);
      } catch (err) {
        console.error('Error adding to cart:', err);
        alert('Failed to add item to cart');
      }
    } else {
      const existing = cart.find(item => item.id === product.id);
      let newCart;
      
      if (existing) {
        newCart = cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...cart, { ...product, quantity: 1 }];
      }
      
      saveCartToStorage(newCart);
    }
  };

  const updateQuantity = async (item, delta) => {
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
      removeFromCart(item);
      return;
    }

    if (USE_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/cart/${item._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: newQuantity,
            userId: 'guest'
          })
        });
        
        if (!res.ok) throw new Error('Failed to update cart');
        
        const data = await res.json();
        setCart(data.items || []);
      } catch (err) {
        console.error('Error updating cart:', err);
      }
    } else {
      const newCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      saveCartToStorage(newCart);
    }
  };

  const removeFromCart = async (item) => {
    if (USE_BACKEND) {
      try {
        const res = await fetch(`${API_BASE}/cart/${item._id}?userId=guest`, {
          method: 'DELETE'
        });
        
        if (!res.ok) throw new Error('Failed to remove from cart');
        
        const data = await res.json();
        setCart(data.items || []);
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    } else {
      saveCartToStorage(cart.filter(cartItem => cartItem.id !== item.id));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.price || item.productId?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!checkoutForm.name || !checkoutForm.email) {
      alert('Please fill in all fields');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      if (USE_BACKEND) {
        const res = await fetch(`${API_BASE}/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: checkoutForm,
            cartItems: cart.map(item => ({
              productId: item.productId?._id || item._id || item.id,
              quantity: item.quantity
            })),
            userId: 'guest'
          })
        });
        
        if (!res.ok) throw new Error('Checkout failed');
        
        const data = await res.json();
        setReceipt(data.receipt);
      } else {
        const receiptData = {
          orderId: `ORD-${Date.now()}`,
          customer: checkoutForm,
          items: cart,
          total: getCartTotal(),
          timestamp: new Date().toISOString(),
        };
        setReceipt(receiptData);
      }

      setShowCheckout(false);
      saveCartToStorage([]);
      setCheckoutForm({ name: '', email: '' });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed. Please try again.');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vibe Commerce</h1>
            <p className="text-xs text-gray-500">
              {USE_BACKEND ? 'Backend Mode' : 'Demo Mode (Fake Store API)'}
            </p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Our Products</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id || product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition hover:scale-101">
                <div className="h-48 bg-gray-100 flex items-center justify-center p-4 ">
                  <img
                    src={product.image}
                    alt={product.title || product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                    {product.title || product.name}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => {
                      const product = item.productId || item;
                      return (
                        <div key={item._id || item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                          <img
                            src={product.image}
                            alt={product.title || product.name}
                            className="w-20 h-20 object-contain"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                              {product.title || product.name}
                            </h3>
                            <p className="text-blue-600 font-bold mb-2">
                              ${product.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item, -1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item, 1)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item)}
                                className="ml-auto p-1 hover:bg-red-100 text-red-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center text-xl font-bold mb-4">
                      <span>Total:</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Checkout</h2>
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Order Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Order Confirmed!</h2>
              <p className="text-gray-600 mt-2">Order #{receipt.orderId}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{receipt.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{receipt.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold">{receipt.items.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;