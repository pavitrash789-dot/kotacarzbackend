import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders from './pages/admin/ManageOrders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1A1A2E', color: '#fff', borderRadius: '12px' }
        }} />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/products" element={<><Navbar /><Products /><Footer /></>} />
            <Route path="/products/:id" element={<><Navbar /><ProductDetail /><Footer /></>} />
            <Route path="/cart" element={<><Navbar /><Cart /><Footer /></>} />
            <Route path="/checkout" element={<><Navbar /><Checkout /><Footer /></>} />
            <Route path="/order-success" element={<><Navbar /><OrderSuccess /><Footer /></>} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="orders" element={<ManageOrders />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;