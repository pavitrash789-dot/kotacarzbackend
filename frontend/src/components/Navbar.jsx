import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import toast from 'react-hot-toast';
import { FiMenu, FiX, FiShoppingBag, FiSearch, FiUser, FiLogOut, FiPackage } from 'react-icons/fi';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { totalItems } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
  ];

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-maroon via-magenta to-saffron text-white text-center py-1.5 text-sm font-medium tracking-wide">
        ✨ Welcome to Pushpa Paridhan — Kota's Finest Saree Collection ✨
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron to-magenta flex items-center justify-center text-white font-bold text-lg shadow-lg">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text leading-tight">Pushpa Paridhan</h1>
              <p className="text-[10px] text-gray-500 -mt-1 tracking-wider uppercase">Sarees & Ethnic Wear</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-all duration-300 hover:text-magenta ${
                  location.pathname === link.path ? 'text-magenta border-b-2 border-magenta pb-0.5' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-600 hover:text-magenta transition-colors">
              <FiSearch size={20} />
            </button>

            {/* Customer account */}
            <div className="relative">
              {isAuthenticated ? (
                <button onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-saffron/10 to-magenta/10 hover:from-saffron/20 hover:to-magenta/20 transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-saffron to-magenta flex items-center justify-center text-white text-xs font-bold">
                    {customer?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark">{customer?.name?.split(' ')[0]}</span>
                </button>
              ) : (
                <Link to="/account/login" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-saffron/10 to-magenta/10 hover:from-saffron/20 hover:to-magenta/20 transition-all text-sm font-medium text-dark">
                  <FiUser size={16} />
                  <span className="hidden sm:block">Sign In</span>
                </Link>
              )}

              {/* Dropdown */}
              {accountOpen && isAuthenticated && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="font-bold text-dark text-sm">{customer?.name}</p>
                      <p className="text-xs text-gray-400">{customer?.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <FiUser size={16} /> My Account
                    </Link>
                    <Link to="/account" onClick={() => { setAccountOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <FiPackage size={16} /> My Orders
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <FiLogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link to="/cart" className="relative text-gray-600 hover:text-magenta transition-colors">
              <FiShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-saffron to-magenta text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3 animate-drape">
            <form action="/products" method="GET" className="flex gap-2">
              <input type="text" name="search" placeholder="Search sarees, kurtis, fabrics..."
                className="flex-1 px-4 py-2 rounded-full border-2 border-pink-200 focus:border-magenta focus:outline-none text-sm" autoFocus />
              <button type="submit" className="px-6 py-2 bg-gradient-to-r from-saffron to-magenta text-white rounded-full font-medium hover:shadow-lg transition-all">
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-6 py-3 font-medium border-l-4 ${
                location.pathname === link.path
                  ? 'border-magenta text-magenta bg-pink-50'
                  : 'border-transparent text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                👤 My Account
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-red-500 hover:bg-red-50 text-sm font-medium">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/account/login" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-magenta hover:bg-pink-50 text-sm font-medium">
              👤 Sign In / Register
            </Link>
          )}
          <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="block px-6 py-3 text-gray-500 hover:bg-gray-50 text-sm">
            Admin Panel
          </Link>
        </div>
      )}
    </nav>
  );
}