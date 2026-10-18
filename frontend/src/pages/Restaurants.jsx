import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { FiStar, FiClock, FiMapPin, FiFilter, FiRefreshCw } from 'react-icons/fi';
import '../styles/restaurants.css';

const CUISINE_OPTIONS = [
  'All',
  'North Indian',
  'Biryani',
  'Pizza',
  'Burgers',
  'South Indian',
  'Chinese',
  'Desserts',
  'Healthy',
];

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCuisine = searchParams.get('cuisine') || 'All';

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, isVegOnly, sortBy]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCuisine !== 'All') {
        params.cuisine = selectedCuisine;
      }
      if (isVegOnly) {
        params.veg = 'true';
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const res = await API.get('/restaurants', { params });
      if (res.success && res.data) {
        setRestaurants(res.data);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisineSelect = (cuisine) => {
    setSelectedCuisine(cuisine);
    if (cuisine === 'All') {
      searchParams.delete('cuisine');
    } else {
      searchParams.set('cuisine', cuisine);
    }
    setSearchParams(searchParams);
  };

  const resetFilters = () => {
    setSelectedCuisine('All');
    setIsVegOnly(false);
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="restaurants-page">
      {/* Sticky Filter Bar */}
      <div className="filter-bar">
        <div className="container filter-bar-inner">
          {/* Cuisine Pills */}
          <div className="cuisine-pills">
            {CUISINE_OPTIONS.map((c) => (
              <button
                key={c}
                className={`cuisine-pill ${selectedCuisine === c ? 'active' : ''}`}
                onClick={() => handleCuisineSelect(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Additional Filter Controls */}
          <div className="filter-controls">
            <button
              className={`veg-toggle-btn ${isVegOnly ? 'active' : ''}`}
              onClick={() => setIsVegOnly(!isVegOnly)}
            >
              🌱 Pure Veg Only
            </button>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort restaurants by"
            >
              <option value="rating">Sort by: Top Rated</option>
              <option value="time">Sort by: Fastest Delivery</option>
              <option value="price">Sort by: Price Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>
            {selectedCuisine === 'All' ? 'All Partner Restaurants' : `${selectedCuisine} Restaurants`}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            {loading ? 'Finding top nearby spots...' : `Found ${restaurants.length} kitchens ready to deliver to your door.`}
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="restaurants-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} className="skeleton" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          /* Empty State */
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🍽️</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No restaurants found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              We couldn't find any partner kitchens matching your selected filters. Try choosing a different cuisine or resetting filters.
            </p>
            <button className="btn btn-primary" onClick={resetFilters}>
              <FiRefreshCw /> Reset All Filters
            </button>
          </div>
        ) : (
          /* Restaurant Cards */
          <div className="restaurants-grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="restaurant-card">
                <Link to={`/restaurants/${restaurant._id}`} className="restaurant-img-wrap">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="restaurant-img"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="restaurant-time-badge">
                    <FiClock size={12} /> {restaurant.deliveryTimeMins} mins
                  </div>
                  {restaurant.isPureVeg && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        backgroundColor: '#10B981',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      PURE VEG
                    </span>
                  )}
                </Link>

                <div className="restaurant-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <Link to={`/restaurants/${restaurant._id}`} className="restaurant-name">
                      {restaurant.name}
                    </Link>
                    <span className="badge badge-rating">
                      <FiStar size={11} fill="#ffffff" /> {restaurant.rating}
                    </span>
                  </div>

                  <p className="restaurant-cuisines">{restaurant.cuisines?.join(' • ')}</p>

                  <div className="restaurant-footer">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <FiMapPin size={12} /> {restaurant.address?.street || 'Bangalore'}
                    </span>
                    <Link to={`/restaurants/${restaurant._id}`} className="btn btn-outline btn-sm">
                      View Menu
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
