import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch } from 'react-icons/fi';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '', category_id: '',
    fabric: '', color: '', occasion: '', pattern: '', stock_quantity: '10',
    featured: false, in_stock: true, images: []
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/products'),
      api.get('/categories')
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data);
      setCategories(catRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', original_price: '', category_id: categories[0]?.id || '', fabric: '', color: '', occasion: '', pattern: '', stock_quantity: '10', featured: false, in_stock: true, images: [] });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      fabric: product.fabric || '',
      color: product.color || '',
      occasion: product.occasion || '',
      pattern: product.pattern || '',
      stock_quantity: (product.stock_quantity || 10).toString(),
      featured: !!product.featured,
      in_stock: !!product.in_stock,
      images: product.images || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock_quantity: parseInt(form.stock_quantity),
      featured: form.featured ? 1 : 0,
      in_stock: form.in_stock ? 1 : 0
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        toast.success('Product updated!');
      } else {
        await api.post('/products', data);
        toast.success('Product created!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const { data } = await api.post('/upload/base64', {
            image: reader.result,
            filename: file.name
          });
          setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
          toast.success('Image uploaded!');
        } catch {
          toast.error('Failed to upload image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.fabric?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products total</p>
        </div>
        <button onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm"
          placeholder="Search products..." />
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Product</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Category</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Price</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Stock</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Status</th>
                  <th className="text-right px-6 py-4 font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-saffron/20 to-magenta/20 flex items-center justify-center text-lg">
                          🧣
                        </div>
                        <div>
                          <p className="font-bold text-dark">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.fabric || 'N/A'} • {product.color || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category_name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold">₹{product.price.toLocaleString()}</p>
                      {product.original_price && <p className="text-xs text-gray-400 line-through">₹{product.original_price.toLocaleString()}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock_quantity > 0 ? 'bg-emerald/10 text-emerald' : 'bg-red-100 text-red-600'
                      }`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.featured ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">⭐ Featured</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" min="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm">
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
                  <input type="text" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" placeholder="e.g., Silk, Cotton" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" placeholder="e.g., Maroon, Blue" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                  <input type="text" value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" placeholder="e.g., Wedding, Party" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
                  <input type="text" value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" placeholder="e.g., Zari, Printed" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" min="0" />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-saffron/10 file:text-saffron file:font-medium" />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 text-magenta rounded" />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                    className="w-4 h-4 text-emerald rounded" />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}