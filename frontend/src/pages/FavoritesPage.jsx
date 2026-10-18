import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { FiHeart, FiStar, FiClock, FiPlus, FiMinus, FiArrowRight } from 'react-icons/fi';
import '../styles/restaurants.css';

const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart, updateQuantity, items: cartItems } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' | 'foods'
  const [favorites, setFavorites] = useState({ restaurants: [], foods: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await API.get('/favorites');
      if (res.success && res.data) {
        setFavorites({
          restaurants: res.data.restaurants || [],
          foods: res.data.foods || [],
        });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id, type) => {
    try {
      await API.post(`/favorites/${id}`, { type });
      showToast('Removed from favorites', 'info');
      if (type === 'restaurant') {
        setFavorites((prev) => ({
          ...prev,
          restaurants: prev.restaurants.filter((r) => r._id !== id),
        }));
      } else {
        setFavorites((prev) => ({
          ...prev,
          foods: prev.foods.filter((f) => f._id !== id),
        }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getItemQuantity = (dishId) => {
    const item = cartItems.find((i) => i._id === dishId || i.foodId === dishId);
    return item ? item.quantity : 0;
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>❤️</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Save Your Favorite Feasts</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Sign in to bookmark top restaurants and mouthwatering dishes for instant one-tap access.
          </p>
          <Link to="/login" className="btn btn-primary">
            Sign In to View Favorites <FiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page" style={{ padding: '3.5rem 1rem 6rem' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>My Favorites ❤️</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Your personally curated collection of favorite spots and delicious bites
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-alt)', padding: '0.3rem', borderRadius: 'var(--radius-full)' }}>
            <button
              className={`cuisine-pill ${activeTab === 'restaurants' ? 'active' : ''}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab('restaurants')}
            >
              Restaurants ({favorites.restaurants.length})
            </button>
            <button
              className={`cuisine-pill ${activeTab === 'foods' ? 'active' : ''}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab('foods')}
            >
              Dishes ({favorites.foods.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="restaurants-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : activeTab === 'restaurants' ? (
          favorites.restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                You haven't bookmarked any restaurants yet.
              </p>
              <Link to="/restaurants" className="btn btn-primary">
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="restaurants-grid">
              {favorites.restaurants.map((restaurant) => (
                <div key={restaurant._id} className="restaurant-card">
                  <div className="restaurant-img-wrap">
                    <img src={restaurant.image} alt={restaurant.name} className="restaurant-img" />
                    <button
                      className="fav-heart-btn active"
                      style={{ position: 'absolute', top: 10, right: 10, width: '36px', height: '36px' }}
                      onClick={() => removeFavorite(restaurant._id, 'restaurant')}
                    >
                      <FiHeart fill="#EF4444" />
                    </button>
                  </div>

                  <div className="restaurant-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <Link to={`/restaurants/${restaurant._id}`} className="restaurant-name">
                        {restaurant.name}
                      </Link>
                      <span className="badge badge-rating">
                        <FiStar size={11} fill="#ffffff" /> {restaurant.rating}
                      </span>
                    </div>

                    <p className="restaurant-cuisines">{restaurant.cuisines?.join(', ')}</p>

                    <div className="restaurant-footer">
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <FiClock size={12} /> {restaurant.deliveryTimeMins} mins
                      </span>
                      <Link to={`/restaurants/${restaurant._id}`} className="btn btn-outline btn-sm">
                        View Menu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : favorites.foods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
              You haven't added any favorite dishes yet.
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              Explore Menus
            </Link>
          </div>
        ) : (
          <div className="menu-items-grid">
            {favorites.foods.map((food) => {
              const qty = getItemQuantity(food._id);
              const restObj = food.restaurant || {};

              return (
                <div key={food._id} className="menu-item-card">
                  <div className="menu-item-details">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span className={`badge ${food.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                        {food.isVeg ? '● VEG' : '▲ NON-VEG'}
                      </span>
                      <button
                        onClick={() => removeFavorite(food._id, 'food')}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Remove from favorites"
                      >
                        <FiHeart fill="#EF4444" />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{food.name}</h3>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                      ₹{food.price}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {food.description}
                    </p>
                  </div>

                  <div className="menu-item-img-wrap">
                    <img src={food.image} alt={food.name} className="menu-item-img" />
                    <div className="menu-item-add-btn-wrap">
                      {qty === 0 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => addToCart(food, restObj)}
                        >
                          <FiPlus /> Add
                        </button>
                      ) : (
                        <div className="qty-stepper" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                          <button
                            className="qty-stepper-btn"
                            onClick={() => updateQuantity(food._id, qty - 1)}
                          >
                            <FiMinus />
                          </button>
                          <span className="qty-val">{qty}</span>
                          <button
                            className="qty-stepper-btn"
                            onClick={() => updateQuantity(food._id, qty + 1)}
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
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
