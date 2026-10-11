import { Link } from 'react-router-dom';
import { FiCheckCircle, FiHome, FiShoppingBag } from 'react-icons/fi';

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center animate-float">
          <FiCheckCircle size={48} className="text-white" />
        </div>

        <h1 className="text-4xl font-bold text-dark mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with Pushpa Paridhan!</p>
        <p className="text-sm text-gray-400 mb-8">
          We'll contact you soon to confirm your order. You can also call us at the store for any queries.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-left">
          <h3 className="font-bold text-dark mb-3">What's Next?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-saffron/10 flex items-center justify-center text-saffron font-bold text-xs shrink-0">1</span>
              <p>Our team will call you to confirm the order details</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-magenta/10 flex items-center justify-center text-magenta font-bold text-xs shrink-0">2</span>
              <p>Your order will be prepared with care</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center text-emerald font-bold text-xs shrink-0">3</span>
              <p>Pay cash on delivery when you receive your order</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">
            <FiHome size={18} /> Home
          </Link>
          <Link to="/products" className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-dark rounded-xl font-bold hover:border-magenta transition-all">
            <FiShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}