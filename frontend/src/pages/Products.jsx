import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);

    api.get(`/products?${params.toString()}`).then(res => {
      let sorted = [...res.data];
      if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price);
      setProducts(sorted);
    }).finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon via-maroon-light to-dark text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Shop Our Collection</h1>
          <p className="text-gray-300">Discover the finest sarees, lehengas, kurtis & more</p>

          {/* Search */}
          <div className="mt-6 max-w-xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); setSearchQuery(e.target.search.value); }}
              className="flex gap-2">
              <input type="text" name="search" defaultValue={searchQuery}
                placeholder="Search sarees, fabrics, colors..."
                className="flex-1 px-6 py-3 rounded-full text-dark focus:outline-none focus:ring-2 focus:ring-gold" />
              <button type="submit" className="px-8 py-3 bg-gradient-to-r from-saffron to-magenta text-white rounded-full font-bold hover:shadow-lg transition-all">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <FiFilter className="text-magenta" />
                <h3 className="font-bold text-dark">Filters</h3>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    !selectedCategory
                      ? 'bg-gradient-to-r from-saffron to-magenta text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Products ({products.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-saffron to-magenta text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-bold text-dark mb-2">Sort By</p>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-magenta">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                Showing <span className="font-bold text-dark">{products.length}</span> products
                {searchQuery && <span> for "<span className="text-magenta">{searchQuery}</span>"</span>}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl h-96 animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-dark mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}