import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { FiStar, FiTruck, FiShield, FiRefreshCw, FiMapPin, FiPhone, FiChevronRight } from 'react-icons/fi';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/categories')
    ]).then(([productsRes, catsRes]) => {
      setFeaturedProducts(productsRes.data);
      setCategories(catsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-maroon via-maroon-light to-dark overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-saffron rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-magenta rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gold rounded-full blur-3xl"></div>
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-overlay opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/20">
                <span className="w-2 h-2 bg-emerald rounded-full animate-pulse"></span>
                New Collection Arrived
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gold-light">Discover</span>
                <br />
                <span className="bg-gradient-to-r from-saffron via-gold to-magenta bg-clip-text text-transparent">
                  Timeless Elegance
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Kota's finest collection of handpicked sarees, lehengas, and ethnic wear.
                Where tradition meets contemporary style.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/products" className="group px-8 py-4 bg-gradient-to-r from-saffron to-magenta text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-saffron/30 transition-all duration-300 flex items-center gap-2">
                  Shop Now
                  <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="tel:+919999999999" className="px-8 py-4 border-2 border-gold/50 text-gold rounded-full font-bold text-lg hover:bg-gold/10 transition-all">
                  Call Us
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex gap-6 pt-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <FiStar className="text-gold" />
                  <span>4.9★ Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTruck className="text-emerald-light" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-saffron" />
                  <span>100% Genuine</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-saffron/30 to-magenta/30 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float">
                  <div className="text-center text-white">
                    <div className="text-8xl mb-4">🧣</div>
                    <p className="text-2xl font-bold text-gold-light">Premium Collection</p>
                    <p className="text-sm text-gray-300 mt-2">Sarees • Lehengas • Kurtis</p>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2 shadow-xl animate-float" style={{animationDelay: '1s'}}>
                  <span className="text-maroon font-bold">New! 🆕</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-emerald to-emerald-light text-white rounded-2xl px-4 py-2 shadow-xl animate-float" style={{animationDelay: '2s'}}>
                  <span className="font-bold">Flat 40% Off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <FiTruck />, label: 'Free Delivery', desc: 'On orders above ₹999' },
            { icon: <FiRefreshCw />, label: 'Easy Returns', desc: '7-day return policy' },
            { icon: <FiShield />, label: 'Quality Assured', desc: '100% genuine products' },
            { icon: <FiStar />, label: 'Best Prices', desc: 'Direct from weavers' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-saffron/5 hover:to-magenta/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron/10 to-magenta/10 flex items-center justify-center text-saffron">
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-dark">{f.label}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 pattern-overlay">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-saffron font-medium tracking-widest uppercase text-sm mb-2">Browse by Category</p>
            <h2 className="text-4xl font-bold gradient-text">Shop Our Collections</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link to={`/products?category=${cat.id}`} key={cat.id}
                className="group card-hover bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-saffron/30">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-saffron/10 to-magenta/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {['🧣', '👗', '👘', '👚', '🎀', '🧶'][i] || '👗'}
                </div>
                <h3 className="font-bold text-sm text-dark group-hover:text-magenta transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.description?.substring(0, 30)}...</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-magenta font-medium tracking-widest uppercase text-sm mb-2">Handpicked for You</p>
              <h2 className="text-4xl font-bold text-dark">Featured Collection</h2>
            </div>
            <Link to="/products" className="text-saffron font-bold hover:text-magenta transition-colors flex items-center gap-1">
              View All <FiChevronRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About / Location Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-dark via-gray-900 to-dark text-white pattern-overlay">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gold font-medium tracking-widest uppercase text-sm">About Us</p>
              <h2 className="text-4xl font-bold leading-tight">
                Welcome to <span className="text-gold-light">Pushpa Paridhan</span>
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Located in the heart of Kota, Rajasthan, Pushpa Paridhan brings you an exquisite collection
                of sarees, lehengas, kurtis, and traditional Indian wear. Our carefully curated selection
                celebrates the rich heritage of Indian textiles while embracing modern trends.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Every piece in our collection is handpicked for quality, comfort, and style. Whether you're
                looking for a stunning bridal lehenga or an elegant everyday kurti, we have something special
                for every occasion.
              </p>

              {/* Reviews */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => <FiStar key={i} size={18} fill="currentColor" />)}
                  </div>
                  <span className="font-bold text-gold">5.0</span>
                  <span className="text-gray-400 text-sm">on Google</span>
                </div>
                <p className="text-gray-300 italic text-sm">
                  "Absolutely love this shop! The saree collection is stunning and the staff is very helpful.
                  Best place in Kota for ethnic wear!"
                </p>
                <p className="text-gray-500 text-xs mt-2">— Happy Customer</p>
              </div>
            </div>

            {/* Location card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-saffron/10 to-magenta/10 rounded-3xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-6">📍 Visit Our Store</h3>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-saffron mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-medium text-white">Address</p>
                      <p className="text-sm">3-B-32, Rangbari Rd, Sector-3, Talwandi, Kota, Rajasthan 324005</p>
                      <p className="text-xs text-gray-400 mt-1">📍 Inside Hotel Simran Palace</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiPhone className="text-magenta mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-medium text-white">Phone</p>
                      <p className="text-sm">+91 XXXXX XXXXX</p>
                    </div>
                  </div>
                </div>

                {/* Mini map placeholder */}
                <div className="mt-6 h-48 rounded-2xl bg-gradient-to-br from-emerald/20 to-emerald/10 border border-emerald/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-sm text-gray-300">Talwandi, Kota</p>
                    <a href="https://maps.google.com/?q=Pushpa+Paridhan+Kota" target="_blank" rel="noopener"
                      className="inline-block mt-2 px-4 py-1.5 bg-emerald/20 text-emerald-light rounded-full text-xs font-medium hover:bg-emerald/30 transition-colors">
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-saffron via-magenta to-maroon text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to Find Your Perfect Saree?</h2>
          <p className="text-xl text-white/80">Visit our store or browse our collection online. Special festive discounts available!</p>
          <Link to="/products" className="inline-block px-10 py-4 bg-white text-maroon font-bold rounded-full text-lg hover:shadow-2xl transition-all hover:scale-105">
            Explore Collection →
          </Link>
        </div>
      </section>
    </div>
  );
}