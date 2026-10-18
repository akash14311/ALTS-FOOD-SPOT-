import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FiBarChart2,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiShield,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiSliders,
  FiArrowLeft,
  FiX,
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'restaurants' | 'dishes' | 'orders'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Restaurants management state
  const [restaurants, setRestaurants] = useState([]);
  const [restSearch, setRestSearch] = useState('');
  const [restStatusFilter, setRestStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [showRestModal, setShowRestModal] = useState(false);
  const [editingRestId, setEditingRestId] = useState(null);
  const [restForm, setRestForm] = useState({
    name: '',
    description: '',
    image: '',
    banner: '',
    cuisines: '',
    deliveryTimeMins: 30,
    priceRange: '₹₹',
    rating: 4.5,
    isVeg: false,
    isPureVeg: false,
    isActive: true,
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
  });

  // Dishes management state
  const [foods, setFoods] = useState([]);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodFilterRest, setFoodFilterRest] = useState('all');
  const [foodFilterCategory, setFoodFilterCategory] = useState('all');
  const [foodFilterType, setFoodFilterType] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [foodFilterStock, setFoodFilterStock] = useState('all'); // 'all' | 'in-stock' | 'out-of-stock'
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);

  // Escape key to close admin modals and go back
  useEffect(() => {
    if (!showRestModal && !showFoodModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowRestModal(false);
        setShowFoodModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRestModal, showFoodModal]);
  const [foodForm, setFoodForm] = useState({
    restaurant: '',
    name: '',
    price: 199,
    category: 'Main Course',
    isVeg: false,
    isPopular: false,
    isAvailable: true,
    rating: 4.5,
    image: '',
    description: '',
  });

  // Orders management state
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    fetchStats();
    fetchRestaurants();
    fetchFoods();
    fetchOrders();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await API.get('/admin/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await API.get('/restaurants?all=true');
      if (res.success && res.data) {
        setRestaurants(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await API.get('/foods?all=true');
      if (res.success && res.data) {
        setFoods(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch {
      // Ignore
    }
  };

  // ================= RESTAURANT CRUD HANDLERS =================
  const handleOpenAddRest = () => {
    setEditingRestId(null);
    setRestForm({
      name: '',
      description: 'Serving authentic culinary recipes prepared with fresh local ingredients and signature seasonings.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      cuisines: 'North Indian, Biryani, Mughlai',
      deliveryTimeMins: 30,
      priceRange: '₹₹',
      rating: 4.5,
      isVeg: false,
      isPureVeg: false,
      isActive: true,
      street: '12th Main, Koramangala 5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
    });
    setShowRestModal(true);
  };

  const handleOpenEditRest = (r) => {
    setEditingRestId(r._id);
    setRestForm({
      name: r.name || '',
      description: r.description || '',
      image: r.image || '',
      banner: r.banner || '',
      cuisines: r.cuisines?.join(', ') || '',
      deliveryTimeMins: r.deliveryTimeMins || 30,
      priceRange: r.priceRange || '₹₹',
      rating: r.rating || 4.5,
      isVeg: r.isVeg || false,
      isPureVeg: r.isPureVeg || false,
      isActive: r.isActive !== undefined ? r.isActive : true,
      street: r.address?.street || '',
      city: r.address?.city || 'Bangalore',
      state: r.address?.state || 'Karnataka',
      pincode: r.address?.pincode || '560001',
    });
    setShowRestModal(true);
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: restForm.name.trim(),
        description: restForm.description.trim(),
        image: restForm.image.trim(),
        banner: restForm.banner.trim(),
        cuisines: restForm.cuisines
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        deliveryTimeMins: Number(restForm.deliveryTimeMins),
        priceRange: restForm.priceRange,
        rating: Number(restForm.rating),
        isVeg: restForm.isVeg,
        isPureVeg: restForm.isPureVeg,
        isActive: restForm.isActive,
        address: {
          street: restForm.street.trim(),
          city: restForm.city.trim(),
          state: restForm.state.trim(),
          pincode: restForm.pincode.trim(),
        },
      };

      if (editingRestId) {
        await API.put(`/restaurants/${editingRestId}`, payload);
        showToast('Restaurant updated successfully', 'success');
      } else {
        await API.post('/restaurants', payload);
        showToast('New restaurant added successfully', 'success');
      }

      setShowRestModal(false);
      fetchRestaurants();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleRestActive = async (r) => {
    try {
      const updatedStatus = !r.isActive;
      await API.put(`/restaurants/${r._id}`, { isActive: updatedStatus });
      showToast(`${r.name} is now ${updatedStatus ? 'Active & Open' : 'Inactive / Closed'}`, 'success');
      fetchRestaurants();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRestaurant = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove all its dishes!`)) {
      return;
    }
    try {
      await API.delete(`/restaurants/${id}`);
      showToast(`Restaurant "${name}" and all dishes removed`, 'info');
      fetchRestaurants();
      fetchFoods();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ================= FOOD CRUD HANDLERS =================
  const handleOpenAddFood = () => {
    setEditingFoodId(null);
    setFoodForm({
      restaurant: restaurants[0]?._id || '',
      name: '',
      price: 240,
      category: 'Main Course',
      isVeg: false,
      isPopular: false,
      isAvailable: true,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      description: 'Prepared fresh with chef signature spices, fresh aromatics and rich garnishing.',
    });
    setShowFoodModal(true);
  };

  const handleOpenEditFood = (f) => {
    setEditingFoodId(f._id);
    setFoodForm({
      restaurant: f.restaurant?._id || f.restaurant || '',
      name: f.name || '',
      price: f.price || 0,
      category: f.category || 'Main Course',
      isVeg: f.isVeg || false,
      isPopular: f.isPopular || false,
      isAvailable: f.isAvailable !== undefined ? f.isAvailable : true,
      rating: f.rating || 4.5,
      image: f.image || '',
      description: f.description || '',
    });
    setShowFoodModal(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        restaurant: foodForm.restaurant,
        name: foodForm.name.trim(),
        price: Number(foodForm.price),
        category: foodForm.category.trim(),
        isVeg: foodForm.isVeg,
        isPopular: foodForm.isPopular,
        isAvailable: foodForm.isAvailable,
        rating: Number(foodForm.rating),
        image: foodForm.image.trim(),
        description: foodForm.description.trim(),
      };

      if (editingFoodId) {
        await API.put(`/foods/${editingFoodId}`, payload);
        showToast('Dish details updated successfully', 'success');
      } else {
        await API.post('/foods', payload);
        showToast('New food item added to restaurant menu', 'success');
      }
      setShowFoodModal(false);
      fetchFoods();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleFoodAvailable = async (f) => {
    try {
      const updatedStatus = !f.isAvailable;
      await API.put(`/foods/${f._id}`, { isAvailable: updatedStatus });
      showToast(`${f.name} marked as ${updatedStatus ? 'In Stock / Available' : 'Out of Stock'}`, 'success');
      fetchFoods();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleFoodPopular = async (f) => {
    try {
      const updatedStatus = !f.isPopular;
      await API.put(`/foods/${f._id}`, { isPopular: updatedStatus });
      showToast(`${f.name} ${updatedStatus ? 'marked as Bestseller ⭐' : 'removed from Bestsellers'}`, 'success');
      fetchFoods();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the menu?`)) return;
    try {
      await API.delete(`/foods/${id}`);
      showToast(`Dish "${name}" deleted`, 'info');
      fetchFoods();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ================= ORDER STATUS HANDLER =================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
      fetchStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ================= FILTERS LOGIC =================
  const filteredRestaurants = restaurants.filter((r) => {
    if (restStatusFilter === 'active' && !r.isActive) return false;
    if (restStatusFilter === 'inactive' && r.isActive) return false;
    if (restSearch.trim()) {
      const q = restSearch.toLowerCase();
      const matchName = r.name?.toLowerCase().includes(q);
      const matchCuisine = r.cuisines?.some((c) => c.toLowerCase().includes(q));
      const matchDesc = r.description?.toLowerCase().includes(q);
      const matchStreet = r.address?.street?.toLowerCase().includes(q);
      const matchCity = r.address?.city?.toLowerCase().includes(q);
      return matchName || matchCuisine || matchDesc || matchStreet || matchCity;
    }
    return true;
  });

  // Extract unique categories for filter
  const uniqueCategories = Array.from(new Set(foods.map((f) => f.category).filter(Boolean)));

  const filteredFoods = foods.filter((f) => {
    if (foodFilterRest !== 'all') {
      const rId = f.restaurant?._id || f.restaurant;
      if (rId !== foodFilterRest) return false;
    }
    if (foodFilterCategory !== 'all' && f.category !== foodFilterCategory) return false;
    if (foodFilterType === 'veg' && !f.isVeg) return false;
    if (foodFilterType === 'non-veg' && f.isVeg) return false;
    if (foodFilterStock === 'in-stock' && !f.isAvailable) return false;
    if (foodFilterStock === 'out-of-stock' && f.isAvailable) return false;
    if (foodSearch.trim()) {
      const q = foodSearch.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchDesc = f.description?.toLowerCase().includes(q);
      const matchCat = f.category?.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    }
    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="admin-page">
      <div className="container">
        {/* Admin Header */}
        <div className="admin-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <FiShield style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
              <h1 style={{ fontSize: '2rem' }}>Admin Control Center</h1>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Full access to add and manage restaurants, catalog dishes, and live customer orders
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchStats();
              fetchRestaurants();
              fetchFoods();
              fetchOrders();
              showToast('Data refreshed', 'info');
            }}
          >
            <FiRefreshCw /> Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiBarChart2 /> Analytics Overview
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <IoFastFoodOutline /> Restaurants ({restaurants.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'dishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('dishes')}
          >
            🍕 Food Items ({foods.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingBag /> Live Orders ({orders.length})
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <FiDollarSign />
                </div>
                <div>
                  <div className="stat-val">₹{stats?.totals?.revenue || 0}</div>
                  <div className="stat-title">Total Revenue</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <FiShoppingBag />
                </div>
                <div>
                  <div className="stat-val">{stats?.totals?.orders || 0}</div>
                  <div className="stat-title">Total Orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <IoFastFoodOutline />
                </div>
                <div>
                  <div className="stat-val">{stats?.totals?.restaurants || 0}</div>
                  <div className="stat-title">Partner Restaurants</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                  <FiUsers />
                </div>
                <div>
                  <div className="stat-val">{stats?.totals?.users || 0}</div>
                  <div className="stat-title">Registered Users</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                  ⚡
                </div>
                <div>
                  <div className="stat-val">{stats?.totals?.activeOrders || 0}</div>
                  <div className="stat-title">Active Orders</div>
                </div>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            {stats?.dailyStats && (
              <div className="charts-grid">
                {/* 7-Day Revenue BarChart */}
                <div className="chart-card">
                  <h3 className="chart-card-title">7-Day Revenue Trend (₹)</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          formatter={(value) => [`₹${value}`, 'Revenue']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Bar dataKey="revenue" fill="#FF4D2E" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 7-Day Orders LineChart */}
                <div className="chart-card">
                  <h3 className="chart-card-title">Orders Volume (Last 7 Days)</h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          formatter={(value) => [value, 'Orders']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#FF8A00"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#FF8A00' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Top 5 Popular Dishes Breakdown */}
            {stats?.topFoods?.length > 0 && (
              <div className="chart-card">
                <h3 className="chart-card-title">Top 5 Best-Selling Dishes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {stats.topFoods.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1rem',
                        backgroundColor: 'var(--bg-alt)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${i === 0 ? 'var(--primary)' : 'var(--accent)'}`,
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>#{i + 1} Best Seller</div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', margin: '0.25rem 0' }}>{f.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <strong>{f.count}</strong> units sold • ₹{f.revenue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: RESTAURANTS CRUD ================= */}
        {activeTab === 'restaurants' && (
          <div className="admin-table-card">
            {/* Top Controls Bar */}
            <div className="admin-controls-bar">
              <div className="admin-filter-group">
                <div className="admin-search-box">
                  <FiSearch className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search restaurant, cuisine, or city..."
                    value={restSearch}
                    onChange={(e) => setRestSearch(e.target.value)}
                  />
                </div>

                <select
                  className="admin-select-filter"
                  value={restStatusFilter}
                  onChange={(e) => setRestStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses ({restaurants.length})</option>
                  <option value="active">Active Only ({restaurants.filter((r) => r.isActive).length})</option>
                  <option value="inactive">Inactive Only ({restaurants.filter((r) => !r.isActive).length})</option>
                </select>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleOpenAddRest}>
                <FiPlus /> Add New Restaurant
              </button>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Restaurant & About</th>
                    <th>Cuisines</th>
                    <th>Rating & Time</th>
                    <th>Price Range</th>
                    <th>Operating Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRestaurants.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No restaurants found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRestaurants.map((r) => (
                      <tr key={r._id}>
                        <td style={{ maxWidth: '300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <img
                              src={r.image}
                              alt={r.name}
                              style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div>
                              <strong style={{ fontSize: '0.95rem' }}>{r.name}</strong>
                              {r.isPureVeg && (
                                <span className="badge badge-veg" style={{ marginLeft: '0.4rem', fontSize: '0.7rem' }}>
                                  🌱 Pure Veg
                                </span>
                              )}
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                📍 {r.address?.street}, {r.address?.city}
                              </div>
                              {r.description && (
                                <div className="admin-desc-snippet" title={r.description}>
                                  ℹ️ {r.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '200px' }}>
                            {r.cuisines?.map((c, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.5rem',
                                  backgroundColor: 'var(--bg-alt)',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border-color)',
                                }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                            <FiStar style={{ color: '#F59E0B' }} /> {r.rating}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            <FiClock style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                            {r.deliveryTimeMins} mins
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{r.priceRange}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>for two</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`toggle-pill-btn ${r.isActive ? 'toggle-pill-active' : 'toggle-pill-inactive'}`}
                            onClick={() => handleToggleRestActive(r)}
                            title="Click to toggle restaurant status"
                          >
                            {r.isActive ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                            {r.isActive ? 'ACTIVE & OPEN' : 'INACTIVE'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="admin-action-btn"
                              onClick={() => handleOpenEditRest(r)}
                              title="Edit Restaurant Details"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              className="admin-action-btn delete"
                              onClick={() => handleDeleteRestaurant(r._id, r.name)}
                              title="Delete Restaurant"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FOOD ITEMS CRUD ================= */}
        {activeTab === 'dishes' && (
          <div className="admin-table-card">
            {/* Top Controls Bar */}
            <div className="admin-controls-bar">
              <div className="admin-filter-group">
                <div className="admin-search-box">
                  <FiSearch className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search dishes by name or description..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                </div>

                <select
                  className="admin-select-filter"
                  value={foodFilterRest}
                  onChange={(e) => setFoodFilterRest(e.target.value)}
                >
                  <option value="all">All Restaurants ({foods.length})</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <select
                  className="admin-select-filter"
                  value={foodFilterCategory}
                  onChange={(e) => setFoodFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  className="admin-select-filter"
                  value={foodFilterType}
                  onChange={(e) => setFoodFilterType(e.target.value)}
                >
                  <option value="all">Diet: All</option>
                  <option value="veg">🌱 Veg Only</option>
                  <option value="non-veg">🍗 Non-Veg</option>
                </select>

                <select
                  className="admin-select-filter"
                  value={foodFilterStock}
                  onChange={(e) => setFoodFilterStock(e.target.value)}
                >
                  <option value="all">Stock: All</option>
                  <option value="in-stock">In Stock Only</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleOpenAddFood}>
                <FiPlus /> Add Food Item
              </button>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dish & Details</th>
                    <th>Restaurant</th>
                    <th>Category & Diet</th>
                    <th>Price & Rating</th>
                    <th>Availability</th>
                    <th>Bestseller</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No dishes found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map((f) => (
                      <tr key={f._id}>
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <img
                              src={f.image}
                              alt={f.name}
                              style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div>
                              <strong style={{ fontSize: '0.95rem' }}>{f.name}</strong>
                              {f.description && (
                                <div className="admin-desc-snippet" title={f.description}>
                                  {f.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{f.restaurant?.name || 'Restaurant'}</strong>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{f.category}</span>
                          </div>
                          <span className={`badge ${f.isVeg ? 'badge-veg' : 'badge-nonveg'}`} style={{ marginTop: '0.2rem' }}>
                            {f.isVeg ? '● VEG' : '▲ NON-VEG'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                            ₹{f.price}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: '600', marginTop: '0.1rem' }}>
                            ★ {f.rating || 4.5}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`toggle-pill-btn ${f.isAvailable ? 'toggle-pill-active' : 'toggle-pill-inactive'}`}
                            onClick={() => handleToggleFoodAvailable(f)}
                            title="Click to toggle in-stock / out-of-stock"
                          >
                            {f.isAvailable ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                            {f.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`toggle-pill-btn ${f.isPopular ? 'toggle-pill-popular' : 'toggle-pill-regular'}`}
                            onClick={() => handleToggleFoodPopular(f)}
                            title="Click to toggle bestseller status"
                          >
                            {f.isPopular ? '⭐ BESTSELLER' : 'Regular'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="admin-action-btn"
                              onClick={() => handleOpenEditFood(f)}
                              title="Edit Dish Details"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              className="admin-action-btn delete"
                              onClick={() => handleDeleteFood(f._id, f.name)}
                              title="Delete Dish"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ORDERS LIVE CONTROL ================= */}
        {activeTab === 'orders' && (
          <div className="admin-table-card">
            <div className="admin-controls-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Live Customer Orders</h2>
                <select
                  className="admin-select-filter"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="Placed">Placed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Restaurant</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Current Status</th>
                    <th>Override Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No orders found with status "{orderStatusFilter}".
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <div>{o.address?.fullName || o.user?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.address?.mobile}</div>
                        </td>
                        <td>{o.restaurant?.name || 'Restaurant'}</td>
                        <td style={{ maxWidth: '240px' }}>
                          <div style={{ fontSize: '0.85rem' }}>
                            {o.items?.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
                          </div>
                        </td>
                        <td>
                          <strong>₹{o.total}</strong>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                o.status === 'Cancelled'
                                  ? 'var(--danger-light)'
                                  : o.status === 'Delivered'
                                  ? 'var(--success-light)'
                                  : 'var(--primary-light)',
                              color:
                                o.status === 'Cancelled'
                                  ? 'var(--danger)'
                                  : o.status === 'Delivered'
                                  ? 'var(--success)'
                                  : 'var(--primary)',
                            }}
                          >
                            ● {o.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="sort-select"
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================= ADD / EDIT RESTAURANT MODAL ================= */}
      {showRestModal && (
        <div className="modal-overlay" onClick={() => setShowRestModal(false)}>
          <div className="modal-content admin-modal-scrollable" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowRestModal(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}
                  title="Back to Restaurants Table"
                >
                  <FiArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IoFastFoodOutline style={{ color: 'var(--primary)' }} />
                  {editingRestId ? 'Edit Restaurant & Details' : 'Add New Partner Restaurant'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowRestModal(false)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Restaurant Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. Royal Biryani Durbar"
                  value={restForm.name}
                  onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                  required
                />
              </div>

              {/* About / Description */}
              <div className="form-group">
                <label className="form-label">About the Restaurant & Specialties</label>
                <textarea
                  className="form-input"
                  style={{ paddingLeft: '1rem', minHeight: '80px', resize: 'vertical' }}
                  placeholder="Describe the restaurant history, ambiance, master chef specialties, or hygiene standards..."
                  value={restForm.description}
                  onChange={(e) => setRestForm({ ...restForm, description: e.target.value })}
                />
              </div>

              {/* Images with Live Previews */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Primary Image URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.image}
                    onChange={(e) => setRestForm({ ...restForm, image: e.target.value })}
                    required
                  />
                  {restForm.image && (
                    <div className="admin-img-preview-box">
                      <img
                        src={restForm.image}
                        alt="Preview"
                        className="admin-img-preview-thumb"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image Preview</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.banner}
                    placeholder="https://..."
                    onChange={(e) => setRestForm({ ...restForm, banner: e.target.value })}
                  />
                  {restForm.banner && (
                    <div className="admin-img-preview-box">
                      <img
                        src={restForm.banner}
                        alt="Banner Preview"
                        className="admin-img-preview-banner"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600';
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Banner Preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cuisines (comma separated) *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. North Indian, Biryani, Mughlai, Kebabs"
                  value={restForm.cuisines}
                  onChange={(e) => setRestForm({ ...restForm, cuisines: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Est. Delivery (mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.deliveryTimeMins}
                    onChange={(e) => setRestForm({ ...restForm, deliveryTimeMins: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price Range</label>
                  <select
                    className="sort-select"
                    style={{ width: '100%', padding: '0.75rem 1rem' }}
                    value={restForm.priceRange}
                    onChange={(e) => setRestForm({ ...restForm, priceRange: e.target.value })}
                  >
                    <option value="₹">₹ (Budget-friendly)</option>
                    <option value="₹₹">₹₹ (Mid-range standard)</option>
                    <option value="₹₹₹">₹₹₹ (Premium Fine Dining)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.rating}
                    onChange={(e) => setRestForm({ ...restForm, rating: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Street / Area</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    value={restForm.street}
                    onChange={(e) => setRestForm({ ...restForm, street: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.city}
                    onChange={(e) => setRestForm({ ...restForm, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.state}
                    onChange={(e) => setRestForm({ ...restForm, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={restForm.pincode}
                    onChange={(e) => setRestForm({ ...restForm, pincode: e.target.value })}
                  />
                </div>
              </div>

              {/* Status & Diet Toggles */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={restForm.isPureVeg}
                    onChange={(e) =>
                      setRestForm({ ...restForm, isPureVeg: e.target.checked, isVeg: e.target.checked })
                    }
                  />
                  🌱 Pure Veg Restaurant
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={restForm.isActive}
                    onChange={(e) => setRestForm({ ...restForm, isActive: e.target.checked })}
                  />
                  ✅ Active & Open for Orders
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRestModal(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingRestId ? 'Save Restaurant Changes' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT FOOD MODAL ================= */}
      {showFoodModal && (
        <div className="modal-overlay" onClick={() => setShowFoodModal(false)}>
          <div className="modal-content admin-modal-scrollable" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowFoodModal(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}
                  title="Back to Foods Table"
                >
                  <FiArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🍕 {editingFoodId ? 'Edit Dish Details' : 'Add New Dish to Menu'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowFoodModal(false)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Assign to Restaurant *</label>
                <select
                  className="sort-select"
                  style={{ width: '100%', padding: '0.75rem 1rem' }}
                  value={foodForm.restaurant}
                  onChange={(e) => setFoodForm({ ...foodForm, restaurant: e.target.value })}
                  required
                >
                  <option value="">-- Choose Restaurant --</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dish Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. Paneer Tikka Butter Masala"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Menu Category *</label>
                  <select
                    className="sort-select"
                    style={{ width: '100%', padding: '0.75rem 1rem' }}
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Chinese">Chinese</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Snacks">Snacks & Sides</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Image URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={foodForm.image}
                    onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={foodForm.rating}
                    onChange={(e) => setFoodForm({ ...foodForm, rating: e.target.value })}
                  />
                </div>
              </div>

              {foodForm.image && (
                <div className="admin-img-preview-box">
                  <img
                    src={foodForm.image}
                    alt="Preview"
                    className="admin-img-preview-thumb"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Dish Thumbnail Preview</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Confirm the image displays properly.
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Details / Description</label>
                <textarea
                  className="form-input"
                  style={{ paddingLeft: '1rem', minHeight: '75px', resize: 'vertical' }}
                  placeholder="Detail the taste, main ingredients, portion size, and special seasonings..."
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                />
              </div>

              {/* Dietary, Bestseller & Stock Availability Flags */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  marginTop: '0.25rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={foodForm.isVeg}
                    onChange={(e) => setFoodForm({ ...foodForm, isVeg: e.target.checked })}
                  />
                  🌱 Vegetarian
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={foodForm.isPopular}
                    onChange={(e) => setFoodForm({ ...foodForm, isPopular: e.target.checked })}
                  />
                  ⭐ Bestseller / Popular
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={foodForm.isAvailable}
                    onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })}
                  />
                  📦 In Stock & Available
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowFoodModal(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingFoodId ? 'Save Dish Changes' : 'Add Dish to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
