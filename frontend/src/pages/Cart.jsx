import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-dark mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet!</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-saffron to-magenta text-white rounded-full font-bold hover:shadow-2xl transition-all">
            <FiShoppingBag /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark">Shopping Cart</h1>
            <p className="text-gray-500">{totalItems} items in your cart</p>
          </div>
          <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1">
            <FiTrash2 size={16} /> Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const gradients = {
                'Maroon': 'from-maroon to-maroon-light',
                'Red': 'from-red-500 to-rose-600',
                'Blue': 'from-blue-500 to-indigo-600',
                'Pink': 'from-pink-400 to-rose-500',
                'Yellow': 'from-yellow-400 to-amber-500',
                'Green': 'from-emerald-500 to-green-600',
              };
              const gradient = gradients[item.color] || 'from-saffron to-magenta';

              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                  <div className={`w-24 h-28 rounded-xl bg-gradient-to-br ${gradient} flex-shrink-0 overflow-hidden`}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">🧣</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-dark">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.fabric || 'Premium'} • {item.color || ''}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-lg text-dark">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-xl text-dark mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-emerald font-medium">{totalPrice >= 999 ? 'FREE' : '₹99'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg gradient-text">
                    ₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString()}
                  </span>
                </div>
              </div>

              <Link to="/checkout"
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-saffron to-magenta text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all active:scale-95">
                Proceed to Checkout
              </Link>

              <Link to="/products" className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-gray-500 hover:text-magenta text-sm font-medium transition-colors">
                <FiArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}