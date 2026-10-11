import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pp_customer_token');
    const savedCustomer = localStorage.getItem('pp_customer');
    if (savedToken && savedCustomer) {
      setToken(savedToken);
      setCustomer(JSON.parse(savedCustomer));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, phone, password) => {
    const { data } = await api.post('/customers/register', { name, email, phone, password });
    localStorage.setItem('pp_customer_token', data.token);
    localStorage.setItem('pp_customer', JSON.stringify(data.customer));
    setToken(data.token);
    setCustomer(data.customer);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post('/customers/login', { email, password });
    localStorage.setItem('pp_customer_token', data.token);
    localStorage.setItem('pp_customer', JSON.stringify(data.customer));
    setToken(data.token);
    setCustomer(data.customer);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pp_customer_token');
    localStorage.removeItem('pp_customer');
    setToken(null);
    setCustomer(null);
  };

  const updateProfile = async (updates) => {
    await api.put('/customers/profile', updates);
    setCustomer(prev => ({ ...prev, ...updates }));
    localStorage.setItem('pp_customer', JSON.stringify({ ...customer, ...updates }));
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, token, loading, register, login, logout, updateProfile, isAuthenticated: !!token }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export const useCustomerAuth = () => useContext(CustomerAuthContext);
