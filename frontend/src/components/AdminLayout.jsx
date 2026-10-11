import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiPackage, FiTag, FiShoppingCart, FiLogOut, FiMenu, FiX, FiHome } from 'react-icons/fi';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin', icon: <FiGrid size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FiPackage size={20} />, label: 'Products' },
    { path: '/admin/categories', icon: <FiTag size={20} />, label: 'Categories' },
    { path: '/admin/orders', icon: <FiShoppingCart size={20} />, label: 'Orders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-dark via-gray-900 to-dark transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron to-magenta flex items-center justify-center text-white font-bold">P</div>
            <div>
              <h1 className="text-white font-bold">Pushpa Paridhan</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-saffron/20 to-magenta/20 text-white border-l-4 border-saffron'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link to="/" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors mb-2">
            <FiHome size={18} /> View Store
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 text-sm transition-colors">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="hidden lg:block">
            <h2 className="font-bold text-dark capitalize">
              {location.pathname === '/admin' ? 'Dashboard' : location.pathname.split('/').pop()}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-magenta flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="text-sm font-medium text-dark hidden sm:block">{user?.username || 'Admin'}</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}