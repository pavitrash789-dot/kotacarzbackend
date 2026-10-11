import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCreditCard, FiTruck } from 'react-icons/fi';

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: '',
  });

  // Pre-fill form if customer is logged in
  useEffect(() => {
    if (customer) {
      setForm({
        customer_name: customer.name || '',
        customer_email: customer.email || '',
        customer_phone: customer.phone || '',
        customer_address: customer.address || '',
        notes: '',
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createRazorpayOrder = async (amount) => {
    const { data } = await api.post('/payments/razorpay/create-order', { amount });
    return data;
  };

  const verifyPayment = async (paymentData) => {
    const { data } = await api.post('/payments/razorpay/verify', paymentData);
    return data;
  };

  const placeOrder = async (paymentId = null) => {
    const orderData = {
      customer_id: customer?.id || null,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      customer_address: form.customer_address,
      items: items.map(i => ({
        product_id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      total_amount: finalTotal,
      payment_method: paymentMethod,
      payment_id: paymentId,
      notes: form.notes,
    };

    const { data } = await api.post('/orders', orderData);
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'online') {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway. Please try again.');
          setLoading(false);
          return;
        }

        // Create order on backend
        const orderData = await createRazorpayOrder(finalTotal);

        // Open Razorpay checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Pushpa Paridhan',
          description: `Order from Pushpa Paridhan (${items.length} items)`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              // Verify payment
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Place order with payment confirmation
              await placeOrder(response.razorpay_payment_id);
              clearCart();
              toast.success('Payment successful! Order placed!');
              navigate('/order-success');
            } catch (err) {
              toast.error('Payment verified but order failed. Please contact us.');
            }
          },
          prefill: {
            name: form.customer_name,
            email: form.customer_email,
            contact: form.customer_phone,
          },
          theme: {
            color: '#FF6B35',
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled');
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setLoading(false);
      } else {
        // COD order
        await placeOrder();
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/order-success');
      }
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-dark mb-2">No items to checkout</h2>
          <Link to="/products" className="text-magenta font-medium">← Go to Shop</Link>
        </div>
      </div>
    );
  }

  const deliveryCharge = totalPrice >= 999 ? 0 : 99;
  const finalTotal = totalPrice + deliveryCharge;

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/cart" className="inline-flex items-center gap-1 text-gray-500 hover:text-magenta mb-6 text-sm font-medium">
          <FiArrowLeft size={14} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-dark mb-8">Checkout</h1>

        {/* Login prompt for guests */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-saffron/10 to-magenta/10 rounded-2xl p-4 mb-6 border border-saffron/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-dark text-sm">Have an account?</p>
              <p className="text-xs text-gray-500">Sign in to track your orders and save your details</p>
            </div>
            <Link to="/account/login" className="px-5 py-2 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all whitespace-nowrap">
              Sign In
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-dark mb-4">Delivery Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-magenta focus:outline-none text-sm" placeholder="Your full name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" name="customer_phone" value={form.customer_phone} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-magenta focus:outline-none text-sm" placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="customer_email" value={form.customer_email} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-magenta focus:outline-none text-sm" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea name="customer_address" value={form.customer_address} onChange={handleChange} rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-magenta focus:outline-none text-sm resize-none" placeholder="Enter your full address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-magenta focus:outline-none text-sm resize-none" placeholder="Any special instructions..." />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg text-dark mb-4">Payment Method</h3>
              <div className="space-y-3">
                {/* Online Payment */}
                <label className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'online' ? 'border-magenta bg-magenta/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="online"
                    checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')}
                    className="w-4 h-4 text-magenta" />
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <FiCreditCard className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-dark">Online Payment (Razorpay)</p>
                    <p className="text-xs text-gray-500">UPI, Cards, Net Banking, Wallets</p>
                  </div>
                </label>

                {/* COD */}
                <label className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'cod' ? 'border-emerald bg-emerald/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="cod"
                    checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-emerald" />
                  <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center">
                    <FiTruck className="text-emerald" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-dark">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'online' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700">
                    🔒 Secure payment powered by Razorpay. You can pay via UPI, Credit/Debit Cards, Net Banking, or Wallets.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg text-dark mb-4">Order Summary</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-dark line-clamp-1">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald font-medium' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg gradient-text">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="mt-6 w-full py-4 bg-gradient-to-r from-saffron to-magenta text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {paymentMethod === 'online' ? 'Processing Payment...' : 'Placing Order...'}
                  </span>
                ) : paymentMethod === 'online' ? (
                  `Pay ₹${finalTotal.toLocaleString()} Now`
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}