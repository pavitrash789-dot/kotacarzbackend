import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { FiUser, FiPackage, FiLogOut, FiEdit2, FiPhone, FiMail, FiMapPin, FiClock, FiChevronRight } from 'react-icons/fi';

export default function CustomerAccount() {
  const { customer, logout, updateProfile, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/account/login');
      return;
    }
    if (isAuthenticated) {
      api.get('/customers/orders').then(res => {
        setOrders(res.data);
      }).finally(() => setLoading(false));

      setForm({ name: customer?.name || '', phone: customer?.phone || '', address: customer?.address || '' });
    }
  }, [isAuthenticated, authLoading, customer]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-dark mb-8">My Account</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              {/* Profile avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-saffron to-magenta flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {customer?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-bold text-dark">{customer?.name}</p>
                <p className="text-xs text-gray-400">{customer?.email}</p>
              </div>

              <nav className="space-y-1">
                <button onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'orders' ? 'bg-gradient-to-r from-saffron/10 to-magenta/10 text-magenta' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <FiPackage size={18} /> My Orders
                </button>
                <button onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'profile' ? 'bg-gradient-to-r from-saffron/10 to-magenta/10 text-magenta' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <FiUser size={18} /> Profile
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                  <FiLogOut size={18} /> Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-dark">My Orders</h2>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse"></div>)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-dark mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                    <Link to="/products" className="inline-block px-8 py-3 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <FiClock size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize self-start ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} × {item.quantity}</span>
                            <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                        )}
                      </div>

                      <div className="border-t pt-3 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">Total: </span>
                          <span className="font-bold text-dark">₹{order.total_amount.toLocaleString()}</span>
                          <span className="text-gray-400 ml-2">({order.payment_method === 'online' ? '💳 Online' : '💵 COD'})</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-dark">Profile Information</h2>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-magenta text-sm font-medium hover:underline">
                      <FiEdit2 size={14} /> Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm resize-none" placeholder="Your delivery address" />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setEditing(false)}
                        className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                      <button type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FiUser className="text-saffron" size={20} />
                      <div>
                        <p className="text-xs text-gray-400">Full Name</p>
                        <p className="font-medium text-dark">{customer?.name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FiMail className="text-magenta" size={20} />
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="font-medium text-dark">{customer?.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FiPhone className="text-emerald" size={20} />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-medium text-dark">{customer?.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FiMapPin className="text-blue-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-400">Address</p>
                        <p className="font-medium text-dark">{customer?.address || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
