import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { FiEye, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [filter, setFilter] = useState('');

  const loadOrders = () => {
    setLoading(true);
    const url = filter ? `/orders?status=${filter}` : '/orders';
    api.get(url).then(res => {
      setOrders(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${status}`);
      loadOrders();
      if (viewOrder?.id === orderId) setViewOrder({ ...viewOrder, status });
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      toast.success('Order deleted');
      loadOrders();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} orders</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-magenta">
          <option value="">All Orders</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Order</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Customer</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Items</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Total</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-600">Date</th>
                  <th className="text-right px-6 py-4 font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-dark">#{order.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.items.length} item(s)</td>
                    <td className="px-6 py-4 font-bold">₹{order.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewOrder(order)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="View">
                          <FiEye size={16} />
                        </button>
                        {order.status === 'pending' && (
                          <button onClick={() => updateStatus(order.id, 'confirmed')}
                            className="p-2 text-gray-400 hover:text-emerald hover:bg-emerald/10 rounded-lg transition-all" title="Confirm">
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteOrder(order.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
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

      {/* Order detail modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-dark">Order #{viewOrder.id.slice(0, 8)}</h3>
              <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-dark"><FiX size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                <p className="font-bold">{viewOrder.customer_name}</p>
                <p className="text-sm text-gray-600">{viewOrder.customer_phone}</p>
                {viewOrder.customer_email && <p className="text-sm text-gray-600">{viewOrder.customer_email}</p>}
                {viewOrder.customer_address && <p className="text-sm text-gray-500 mt-1">{viewOrder.customer_address}</p>}
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Items</p>
                <div className="space-y-2">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                      </div>
                      <p className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg gradient-text">₹{viewOrder.total_amount.toLocaleString()}</span>
              </div>

              {viewOrder.notes && (
                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="text-xs text-yellow-600 font-medium">Notes:</p>
                  <p className="text-sm text-yellow-700">{viewOrder.notes}</p>
                </div>
              )}

              {/* Status update */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button key={status}
                      onClick={() => updateStatus(viewOrder.id, status)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        viewOrder.status === status
                          ? `${statusColors[status]} ring-2 ring-offset-1`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}