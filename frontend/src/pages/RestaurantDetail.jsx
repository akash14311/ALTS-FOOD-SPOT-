import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiStar,
  FiClock,
  FiMapPin,
  FiHeart,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiArrowRight,
} from 'react-icons/fi';
import '../styles/restaurants.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { addToCart, updateQuantity, items: cartItems, total, totalItemsCount, restaurant: cartRestaurant } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [highlightedDishId, setHighlightedDishId] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const highlightDishName = searchParams.get('highlight');

  useEffect(() => {
    fetchRestaurant();
    checkFavoriteStatus();
  }, [id]);

  // Smooth auto-scroll and highlight when navigating from 3D stage
  useEffect(() => {
    if (!loading && restaurantData && highlightDishName) {
      const q = highlightDishName.toLowerCase().trim();
      let matchedDish = null;
      let matchedCategory = null;

      for (const cat of restaurantData.categories || []) {
        const found = (restaurantData.menuByCategory[cat] || []).find((d) => {
          const dName = d.name.toLowerCase();
          return dName.includes(q) || q.includes(dName) || dName.includes(q.split(' ')[0]);
        });
        if (found) {
          matchedDish = found;
          matchedCategory = cat;
          break;
        }
      }

      if (matchedDish) {
        if (matchedCategory) setActiveCategory(matchedCategory);
        setHighlightedDishId(matchedDish._id);
        setTimeout(() => {
          const el = document.getElementById(`dish-item-${matchedDish._id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);

        const timer = setTimeout(() => setHighlightedDishId(null), 4500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, restaurantData, highlightDishName]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/restaurants/${id}`);
      if (res.success && res.data) {
        setRestaurantData(res.data);
        if (res.data.categories?.length > 0) {
          setActiveCategory(res.data.categories[0]);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get('/favorites');
      if (res.success && res.data?.restaurants) {
        const hasFav = res.data.restaurants.some((r) => r._id === id);
        setIsFavorite(hasFav);
      }
    } catch {
      // Ignore background favorite fetch error
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save favorites', 'info');
      return;
    }
    try {
      const prev = isFavorite;
      setIsFavorite(!prev); // Optimistic UI
      const res = await API.post(`/favorites/${id}`, { type: 'restaurant' });
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      setIsFavorite((prev) => !prev);
      showToast(err.message, 'error');
    }
  };

  const getItemQuantity = (dishId) => {
    const item = cartItems.find((i) => i._id === dishId || i.foodId === dishId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2>Restaurant not found</h2>
        <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const { restaurant, menuByCategory, categories } = restaurantData;

  return (
    <div className="restaurant-detail-page">
      {/* Restaurant Header Hero */}
      <section className="restaurant-hero">
        <div className="container restaurant-hero-card">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="restaurant-hero-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80';
            }}
          />

          <div className="restaurant-hero-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <h1 className="restaurant-hero-title">{restaurant.name}</h1>
              <button
                className={`fav-heart-btn ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                aria-label="Add to favorites"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiHeart fill={isFavorite ? '#EF4444' : 'none'} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
              {restaurant.cuisines?.join(', ')}
            </p>

            <div className="restaurant-meta-pills">
              <span className="badge badge-rating" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                <FiStar size={14} fill="#ffffff" /> {restaurant.rating}
              </span>
              <div className="meta-pill">
                <FiClock style={{ color: 'var(--primary)' }} /> {restaurant.deliveryTimeMins} mins
              </div>
              <div className="meta-pill">
                💳 {restaurant.priceRange} for two
              </div>
              {restaurant.isPureVeg && (
                <span className="badge badge-veg">🌱 PURE VEG</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <FiMapPin /> {restaurant.address?.street}, {restaurant.address?.city}{restaurant.address?.state ? `, ${restaurant.address?.state}` : ''} {restaurant.address?.pincode ? `- ${restaurant.address?.pincode}` : ''}
            </div>

            {restaurant.description && (
              <div style={{ marginTop: '0.85rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5', background: 'var(--bg-alt)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', marginBottom: '0.2rem' }}>About {restaurant.name}</strong>
                {restaurant.description}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Category Tabs Navigation */}
      <div className="menu-category-nav">
        <div className="container" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                const el = document.getElementById(`category-${cat}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {cat} ({menuByCategory[cat]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Menu Categories & Dishes */}
      <div className="container" style={{ padding: '2rem 1rem 6rem' }}>
        {categories.map((cat) => {
          const dishes = menuByCategory[cat] || [];

          return (
            <section key={cat} id={`category-${cat}`} className="menu-section">
              <h2 className="menu-section-title">
                {cat} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>({dishes.length} items)</span>
              </h2>

              <div className="menu-items-grid">
                {dishes.map((dish) => {
                  const qty = getItemQuantity(dish._id);

                  return (
                    <div
                      key={dish._id}
                      id={`dish-item-${dish._id}`}
                      className={`menu-item-card ${highlightedDishId === dish._id ? 'highlighted-dish-card' : ''}`}
                    >
                      <div className="menu-item-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className={`badge ${dish.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                            {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                          </span>
                          {dish.isPopular && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: '700' }}>
                              ★ BESTSELLER
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{dish.name}</h3>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                          ₹{dish.price}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {dish.description}
                        </p>
                      </div>

                      <div className="menu-item-img-wrap">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="menu-item-img"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
                          }}
                        />

                        <div className="menu-item-add-btn-wrap">
                          {qty === 0 ? (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.45rem 1.25rem', boxShadow: 'var(--shadow-md)' }}
                              onClick={() => addToCart(dish, restaurant)}
                              id={`add-food-${dish._id}`}
                            >
                              <FiPlus /> Add
                            </button>
                          ) : (
                            <div className="qty-stepper" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
                              <button
                                className="qty-stepper-btn"
                                onClick={() => updateQuantity(dish._id, qty - 1)}
                                aria-label="Decrease quantity"
                              >
                                <FiMinus />
                              </button>
                              <span className="qty-val">{qty}</span>
                              <button
                                className="qty-stepper-btn"
                                onClick={() => updateQuantity(dish._id, qty + 1)}
                                aria-label="Increase quantity"
                              >
                                <FiPlus />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="floating-bottom-cart-bar">
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} | ₹{total}
            </div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              From {cartRestaurant?.name || 'Selected Restaurant'}
            </div>
          </div>

          <Link to="/cart" className="btn btn-secondary btn-sm" style={{ fontWeight: '700' }}>
            <FiShoppingBag /> View Cart <FiArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
