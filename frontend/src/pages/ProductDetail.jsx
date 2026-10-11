import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiArrowLeft, FiMinus, FiPlus, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(res => {
      setProduct(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-dark mb-2">Product Not Found</h2>
        <Link to="/products" className="text-magenta font-medium">← Back to Shop</Link>
      </div>
    </div>
  );

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const gradients = {
    'Maroon': 'from-maroon to-maroon-light',
    'Red': 'from-red-500 to-rose-600',
    'Blue': 'from-blue-500 to-indigo-600',
    'Pink': 'from-pink-400 to-rose-500',
    'Yellow': 'from-yellow-400 to-amber-500',
    'Green': 'from-emerald-500 to-green-600',
  };
  const gradient = gradients[product.color] || 'from-saffron to-magenta';

  const images = product.images?.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-magenta transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-magenta transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-dark font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className={`aspect-[3/4] rounded-3xl bg-gradient-to-br ${gradient} overflow-hidden`}>
              {images.length > 0 ? (
                <img src={images[selectedImage]} alt={product.name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[120px] opacity-30">🧣</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${selectedImage === i ? 'border-magenta' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 mb-3">
                {product.fabric && <span className="px-3 py-1 bg-saffron/10 text-saffron rounded-full text-xs font-medium">{product.fabric}</span>}
                {product.occasion && <span className="px-3 py-1 bg-magenta/10 text-magenta rounded-full text-xs font-medium">{product.occasion}</span>}
                {product.featured ? <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">⭐ Featured</span> : null}
              </div>
              <h1 className="text-3xl font-bold text-dark">{product.name}</h1>
              {product.category_name && (
                <p className="text-gray-500 mt-1">{product.category_name}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-dark">₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.original_price.toLocaleString()}</span>
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Product details */}
            <div className="grid grid-cols-2 gap-3">
              {product.fabric && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400">Fabric</p>
                  <p className="font-bold text-dark">{product.fabric}</p>
                </div>
              )}
              {product.color && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400">Color</p>
                  <p className="font-bold text-dark">{product.color}</p>
                </div>
              )}
              {product.pattern && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400">Pattern</p>
                  <p className="font-bold text-dark">{product.pattern}</p>
                </div>
              )}
              {product.stock_quantity !== undefined && (
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400">Availability</p>
                  <p className={`font-bold ${product.stock_quantity > 0 ? 'text-emerald' : 'text-red-500'}`}>
                    {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                  </p>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiMinus />
                </button>
                <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiPlus />
                </button>
              </div>

              <button onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-saffron to-magenta text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-saffron/20 transition-all active:scale-95">
                <FiShoppingBag size={20} />
                Add to Cart — ₹{(product.price * quantity).toLocaleString()}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center p-3">
                <FiTruck className="mx-auto text-saffron mb-1" size={20} />
                <p className="text-xs font-bold text-dark">Free Delivery</p>
              </div>
              <div className="text-center p-3">
                <FiShield className="mx-auto text-emerald mb-1" size={20} />
                <p className="text-xs font-bold text-dark">Quality Assured</p>
              </div>
              <div className="text-center p-3">
                <FiRefreshCw className="mx-auto text-magenta mb-1" size={20} />
                <p className="text-xs font-bold text-dark">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}