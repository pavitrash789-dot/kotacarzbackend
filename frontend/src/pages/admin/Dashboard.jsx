import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { FiPackage, FiShoppingCart, FiDollarSign, FiTag, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-32 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: <FiPackage />, gradient: 'from-saffron to-amber-500', link: '/admin/products' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingCart />, gradient: 'from-magenta to-rose-500', link: '/admin/orders' },
    { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, gradient: 'from-emerald to-emerald-light', link: '/admin/orders' },
    { label: 'Categories', value: stats.totalCategories, icon: <FiTag />, gradient: 'from-blue-500 to-indigo-600', link: '/admin/categories' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Link to={card.link} key={i}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <FiTrendingUp className="text-gray-300 group-hover:text-emerald transition-colors" size={20} />
            </div>
            <p className="text-2xl font-bold text-dark">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/products" className="bg-gradient-to-br from-saffron/10 to-magenta/10 rounded-2xl p-6 border border-saffron/20 hover:shadow-lg transition-all">
          <h3 className="font-bold text-dark text-lg mb-2">📦 Manage Products</h3>
          <p className="text-sm text-gray-500">Add, edit, or remove products from your store</p>
        </Link>
        <Link to="/admin/categories" className="bg-gradient-to-br from-magenta/10 to-rose/10 rounded-2xl p-6 border border-magenta/20 hover:shadow-lg transition-all">
          <h3 className="font-bold text-dark text-lg mb-2">🏷️ Manage Categories</h3>
          <p className="text-sm text-gray-500">Organize products into categories</p>
        </Link>
        <Link to="/admin/orders" className="bg-gradient-to-br from-emerald/10 to-green/10 rounded-2xl p-6 border border-emerald/20 hover:shadow-lg transition-all">
          <h3 className="font-bold text-dark text-lg mb-2">🛒 View Orders</h3>
          <p className="text-sm text-gray-500">Track and manage customer orders</p>
        </Link>
      </div>

      {/* Pending orders alert */}
      {stats.pendingOrders > 0 && (
        <div className="bg-gradient-to-r from-saffron/10 to-magenta/10 rounded-2xl p-6 border border-saffron/20">
          <h3 className="font-bold text-dark mb-2">⚠️ {stats.pendingOrders} Pending Order(s)</h3>
          <p className="text-sm text-gray-500 mb-4">You have orders waiting to be processed.</p>
          <Link to="/admin/orders" className="inline-block px-6 py-2 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
            View Orders
          </Link>
        </div>
      )}
    </div>
  );
}