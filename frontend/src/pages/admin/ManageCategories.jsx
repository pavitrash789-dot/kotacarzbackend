import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sort_order: '0' });

  const loadCategories = () => {
    setLoading(true);
    api.get('/categories').then(res => {
      setCategories(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', sort_order: '0' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description || '', sort_order: (cat.sort_order || 0).toString() });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, sort_order: parseInt(form.sort_order) };

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, data);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', data);
        toast.success('Category created!');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products in this category will become uncategorized.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">
          <FiPlus size={18} /> Add Category
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse"></div>)
        ) : categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron/10 to-magenta/10 flex items-center justify-center text-2xl">
                🏷️
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(cat)}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-dark text-lg">{cat.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description || 'No description'}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark"><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta text-sm" />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-saffron to-magenta text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}