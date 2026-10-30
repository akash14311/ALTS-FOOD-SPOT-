import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { getDishQuantity } from '../services/mockData';
import { FiSearch, FiStar, FiClock, FiPlus, FiMinus, FiX, FiActivity } from 'react-icons/fi';
import NutritionFactsModal from '../components/common/NutritionFactsModal';
import '../styles/restaurants.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState({ restaurants: [], foods: [], cuisines: [] });
  const [loading, setLoading] = useState(false);
  const [selectedQtyMap, setSelectedQtyMap] = useState({});
  const [nutritionModalDish, setNutritionModalDish] = useState(null);
  const { addToCart, updateQuantity, items: cartItems } = useCart();

  const handleSelectedQtyChange = (dishId, delta) => {
    setSelectedQtyMap((prev) => {
      const current = prev[dishId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [dishId]: next };
    });
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ restaurants: [], foods: [], cuisines: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await API.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
    setResults({ restaurants: [], foods: [], cuisines: [] });
  };

  const getItemQuantity = (dishId) => {
    const item = cartItems.find((i) => i._id === dishId || i.foodId === dishId);
    return item ? item.quantity : 0;
  };

  const hasNoMatches =
    query.trim().length > 0 &&
    !loading &&
    results.restaurants.length === 0 &&
    results.foods.length === 0 &&
    results.cuisines.length === 0;

  return (
    <div className="search-page" style={{ padding: '3rem 1rem 6rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Search Header Bar */}
        <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.25rem',
              boxShadow: 'var(--glass-shadow), inset 0 1px 1px 0 var(--glass-highlight)',
              border: '1.5px solid var(--glass-border)',
            }}
          >
            <FiSearch style={{ color: 'var(--primary)', fontSize: '1.4rem', marginRight: '0.75rem' }} />
            <input
              type="text"
              placeholder="Search for restaurants, biryani, pizzas, burgers, desserts..."
              value={query}
              onChange={handleInputChange}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '1.1rem',
                fontFamily: 'inherit',
                color: 'var(--text-main)',
              }}
              autoFocus
              id="search-main-input"
            />
            {query && (
              <button
                onClick={clearSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
                aria-label="Clear search input"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="skeleton" style={{ width: '220px', height: '28px', margin: '0 auto 1.5rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="skeleton" style={{ height: '120px' }}></div>
              <div className="skeleton" style={{ height: '120px' }}></div>
            </div>
          </div>
        )}

        {/* Empty State as specified */}
        {hasNoMatches && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😋</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No delicious matches found 😋</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              We couldn't find any dishes or restaurants matching "{query}". Check for spelling or try searching for generic terms like "Biryani" or "Burger".
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              Explore All Restaurants
            </Link>
          </div>
        )}

        {/* Results: Cuisines */}
        {results.cuisines?.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              Matching Cuisines
            </h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {results.cuisines.map((c) => (
                <Link
                  key={c}
                  to={`/restaurants?cuisine=${encodeURIComponent(c)}`}
                  className="cuisine-pill active"
                  style={{ textDecoration: 'none' }}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Results: Restaurants */}
        {results.restaurants?.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Restaurants ({results.restaurants.length})
            </h2>
            <div className="restaurants-grid">
              {results.restaurants.map((restaurant) => (
                <div key={restaurant._id} className="restaurant-card">
                  <Link to={`/restaurants/${restaurant._id}`} className="restaurant-img-wrap">
                    <img src={restaurant.image} alt={restaurant.name} className="restaurant-img" />
                    <div className="restaurant-time-badge">
                      <FiClock size={12} /> {restaurant.deliveryTimeMins} mins
                    </div>
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

                    <p className="restaurant-cuisines">{restaurant.cuisines?.join(', ')}</p>

                    <div className="restaurant-footer">
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        📍 {restaurant.address?.street || 'Bangalore'}
                      </span>
                      <Link to={`/restaurants/${restaurant._id}`} className="btn btn-outline btn-sm">
                        View Menu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results: Dishes */}
        {results.foods?.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              Dishes ({results.foods.length})
            </h2>
            <div className="menu-items-grid">
              {results.foods.map((food) => {
                const qty = getItemQuantity(food._id);
                const restObj = food.restaurant || {};

                return (
                  <div key={food._id} className="menu-item-card">
                    <div className="menu-item-details">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge ${food.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                          {food.isVeg ? '● VEG' : '▲ NON-VEG'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          from{' '}
                          <Link to={`/restaurants/${restObj._id}`} style={{ fontWeight: '600', color: 'var(--primary)' }}>
                            {restObj.name}
                          </Link>
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{food.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                          ₹{food.price}
                        </span>
                        <span className="dish-quantity-pill">
                          📦 Qty: <strong>{food.quantity || getDishQuantity(food)}</strong>
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {food.description}
                      </p>
                      <div style={{ marginTop: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-nutrition-facts"
                          onClick={() => setNutritionModalDish({ ...food, restaurantInfo: restObj })}
                          title={`View detailed macro nutrition facts for ${food.name}`}
                        >
                          <FiActivity size={12} /> Nutrition Facts
                        </button>
                      </div>
                    </div>

                    <div className="menu-item-img-wrap">
                      <img src={food.image} alt={food.name} className="menu-item-img" />
                      <div className="menu-item-add-btn-wrap">
                        {qty === 0 ? (
                          <div className="product-qty-selector">
                            <div className="qty-picker">
                              <button
                                type="button"
                                className="qty-picker-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectedQtyChange(food._id, -1);
                                }}
                                disabled={(selectedQtyMap[food._id] || 1) <= 1}
                                aria-label="Decrease quantity"
                                title="Decrease quantity to purchase"
                              >
                                <FiMinus size={11} />
                              </button>
                              <span className="qty-picker-val">{selectedQtyMap[food._id] || 1}</span>
                              <button
                                type="button"
                                className="qty-picker-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectedQtyChange(food._id, 1);
                                }}
                                aria-label="Increase quantity"
                                title="Increase quantity to purchase"
                              >
                                <FiPlus size={11} />
                              </button>
                            </div>

                            <button
                              className="btn btn-primary btn-sm btn-add-qty"
                              onClick={() => addToCart(food, restObj, selectedQtyMap[food._id] || 1)}
                              id={`add-search-food-${food._id}`}
                              title={`Add ${selectedQtyMap[food._id] || 1} to cart`}
                            >
                              <FiPlus /> Add {(selectedQtyMap[food._id] || 1) > 1 ? `(${selectedQtyMap[food._id]})` : ''}
                            </button>
                          </div>
                        ) : (
                          <div className="product-in-cart-wrap">
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
                            <span className="in-cart-subtext">✓ {qty} in cart</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Macro Nutrition Facts Modal */}
      <NutritionFactsModal
        isOpen={Boolean(nutritionModalDish)}
        onClose={() => setNutritionModalDish(null)}
        dish={nutritionModalDish}
        restaurant={nutritionModalDish?.restaurantInfo || results.restaurants[0]}
      />
    </div>
  );
};

export default SearchPage;
