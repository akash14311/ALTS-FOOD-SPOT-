import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  FiShoppingBag,
  FiClock,
  FiArrowRight,
  FiRepeat,
  FiMapPin,
} from 'react-icons/fi';
import '../styles/restaurants.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Active' | 'Delivered' | 'Cancelled'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;

    clearCart();
    order.items.forEach((item) => {
      addToCart(
        {
          _id: item.foodId || item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
        },
        order.restaurant,
        item.quantity || 1
      );
    });

    showToast(`Items from ${order.restaurant?.name || 'order'} added to your cart!`, 'success');
    navigate('/cart');
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') {
      return ['Placed', 'Accepted', 'Preparing', 'Out for Delivery'].includes(o.status);
    }
    return o.status === activeTab;
  });

  return (
    <div style={{ padding: '3.5rem 1rem 6rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>My Orders</h1>
            <p style={{ color: 'var(--text-muted)' }}>Track active meals and view past culinary delights</p>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-alt)', padding: '0.3rem', borderRadius: 'var(--radius-full)' }}>
            {['All', 'Active', 'Delivered', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                className={`cuisine-pill ${activeTab === tab ? 'active' : ''}`}
                style={{ border: 'none' }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: '160px', borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No orders found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You don't have any {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders right now.
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              <FiShoppingBag /> Explore Restaurants
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredOrders.map((order) => {
              const isCancelled = order.status === 'Cancelled';
              const isDelivered = order.status === 'Delivered';

              return (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Top Meta Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={order.restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&auto=format&fit=crop&q=80'}
                        alt={order.restaurant?.name}
                        style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                      <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                          {order.restaurant?.name || 'Restaurant'}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: isCancelled ? 'var(--danger-light)' : isDelivered ? 'var(--success-light)' : 'var(--primary-light)',
                        color: isCancelled ? 'var(--danger)' : isDelivered ? 'var(--success)' : 'var(--primary)',
                      }}
                    >
                      ● {order.status}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                        {order.items?.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        Total: <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>₹{order.total}</strong> ({order.paymentMethod})
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleReorder(order)}
                      >
                        <FiRepeat /> Reorder
                      </button>

                      <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm">
                        Track Order <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
