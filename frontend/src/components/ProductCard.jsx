import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiHeart } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  // Generate a gradient based on product color
  const gradients = {
    'Maroon': 'from-maroon to-maroon-light',
    'Red': 'from-red-500 to-rose-600',
    'Blue': 'from-blue-500 to-indigo-600',
    'Pink': 'from-pink-400 to-rose-500',
    'Yellow': 'from-yellow-400 to-amber-500',
    'Green': 'from-emerald-500 to-green-600',
  };
  const gradient = gradients[product.color] || 'from-saffron to-magenta';

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="card-hover bg-white rounded-2xl overflow-hidden border border-gray-100">
        {/* Image area */}
        <div className={`relative aspect-[3/4] bg-gradient-to-br ${gradient} overflow-hidden`}>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-50">🧣</span>
            </div>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {discount}% OFF
            </div>
          )}

          {/* Quick add */}
          <button onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-magenta opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:bg-magenta hover:text-white">
            <FiShoppingBag size={18} />
          </button>

          {/* Wishlist */}
          <button onClick={(e) => { e.preventDefault(); toast('Wishlist coming soon!'); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-lg">
            <FiHeart size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-saffron/10 text-saffron rounded-full font-medium">{product.fabric || 'Premium'}</span>
            {product.color && <span className="text-xs text-gray-400">{product.color}</span>}
          </div>
          <h3 className="font-bold text-dark text-sm group-hover:text-magenta transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-dark">₹{product.price.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
            )}
          </div>
          {product.occasion && (
            <p className="text-xs text-gray-400 mt-1">Perfect for {product.occasion}</p>
          )}
        </div>
      </div>
    </Link>
  );
}