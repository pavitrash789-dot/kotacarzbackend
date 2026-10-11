import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiClock, FiInstagram, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-dark via-gray-900 to-dark text-white">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-saffron via-magenta to-gold"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron to-magenta flex items-center justify-center text-white font-bold text-lg">P</div>
              <div>
                <h3 className="text-xl font-bold">Pushpa Paridhan</h3>
                <p className="text-xs text-gray-400">Sarees & Ethnic Wear</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kota's finest collection of sarees, lehengas, kurtis and traditional wear. Celebrating the beauty of Indian textiles since years.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform">
                <FiInstagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center hover:scale-110 transition-transform">
                <FiFacebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">Quick Links</h4>
            <div className="space-y-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/products', label: 'Shop All' },
                { path: '/cart', label: 'Your Cart' },
                { path: '/admin/login', label: 'Admin Panel' },
              ].map(link => (
                <Link key={link.path} to={link.path} className="block text-gray-400 hover:text-saffron transition-colors text-sm">
                  → {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <FiMapPin className="text-saffron mt-0.5 shrink-0" size={16} />
                <span>3-B-32, Rangbari Rd, Sector-3, Talwandi, Kota, Rajasthan 324005</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-magenta shrink-0" size={16} />
                <span>+91 XXXXX XXXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-emerald shrink-0" size={16} />
                <span>info@pushpapidhan.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">Store Hours</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FiClock className="text-saffron shrink-0" size={16} />
                <span>Mon - Sat: 11:00 AM - 9:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-magenta shrink-0" size={16} />
                <span>Sunday: 12:00 PM - 8:00 PM</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-saffron/10 to-magenta/10 rounded-xl border border-saffron/20">
              <p className="text-xs text-gold font-medium">📍 Located in Hotel Simran Palace</p>
              <p className="text-xs text-gray-400 mt-1">⭐ 4.9/5 on Google (8 Reviews)</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>© 2024 Pushpa Paridhan. All rights reserved. Made with ❤️ in Kota, Rajasthan</p>
        </div>
      </div>
    </footer>
  );
}