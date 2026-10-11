import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

export default function CustomerAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useCustomerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
        navigate('/account');
      } else {
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await register(form.name, form.email, form.phone, form.password);
        toast.success('Account created! Welcome!');
        navigate('/account');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-pink-50 to-saffron/5 flex items-center justify-center px-4 pattern-overlay">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-magenta mb-8 text-sm font-medium transition-colors">
          <FiArrowLeft size={14} /> Back to Store
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-maroon via-magenta to-saffron p-8 text-white text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl mb-3">
              🧣
            </div>
            <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back!' : 'Join Pushpa Paridhan'}</h2>
            <p className="text-white/80 text-sm mt-1">{isLogin ? 'Sign in to your account' : 'Create your account to track orders'}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 font-bold text-sm transition-all ${
                isLogin ? 'text-magenta border-b-2 border-magenta' : 'text-gray-400 hover:text-gray-600'
              }`}>
              Sign In
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 font-bold text-sm transition-all ${
                !isLogin ? 'text-magenta border-b-2 border-magenta' : 'text-gray-400 hover:text-gray-600'
              }`}>
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm"
                    placeholder="Your full name" required={!isLogin} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm"
                  placeholder="your@email.com" required />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm"
                    placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm"
                  placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-magenta focus:outline-none text-sm"
                    placeholder="••••••••" required={!isLogin} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-saffron/20 transition-all disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
