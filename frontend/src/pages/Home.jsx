import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  mockCuisines,
  mockRestaurants as fallbackRestaurants,
  mockPopularDishes as fallbackDishes,
  mockOffers,
  mockReviews,
} from '../services/mockData';
import {
  FiSearch,
  FiStar,
  FiClock,
  FiShoppingBag,
  FiArrowRight,
  FiCopy,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import Hero3DStage from '../components/home/Hero3DStage';
import FoodVisionStage from '../components/home/FoodVisionStage';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, updateQuantity, items: cartItems } = useCart();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [restaurants, setRestaurants] = useState(fallbackRestaurants);
  const [popularDishes, setPopularDishes] = useState(fallbackDishes);
  const [offers, setOffers] = useState(mockOffers);

  // Fetch real data on mount from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, foodsRes, couponsRes] = await Promise.allSettled([
          API.get('/restaurants'),
          API.get('/foods'),
          API.get('/coupons'),
        ]);

        if (restRes.status === 'fulfilled' && restRes.value.success && restRes.value.data?.length > 0) {
          setRestaurants(restRes.value.data.slice(0, 6));
        }

        if (foodsRes.status === 'fulfilled' && foodsRes.value.success && foodsRes.value.data?.length > 0) {
          const popular = foodsRes.value.data.filter((f) => f.isPopular).slice(0, 6);
          if (popular.length > 0) {
            setPopularDishes(popular);
          }
        }

        if (couponsRes.status === 'fulfilled' && couponsRes.value.success && couponsRes.value.data?.length > 0) {
          const apiOffers = couponsRes.value.data.map((c) => ({
            code: c.code,
            title: c.description,
            discount: c.type === 'percent' ? `${c.value}% OFF` : c.type === 'freeDelivery' ? 'FREE DEL' : `₹${c.value} OFF`,
            desc: `Min order ₹${c.minOrder || 0}${c.maxDiscount ? ` (Max ₹${c.maxDiscount})` : ''}`,
            badge: c.code === 'FIRST50' ? 'Welcome Special' : 'Special Offer',
            minOrder: c.minOrder,
          }));
          setOffers(apiOffers);
        }
      } catch (err) {
        console.warn('Home live fetch fallback:', err);
      }
    };

    fetchData();
  }, []);

  // Live search preview with real API debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await API.get(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.success && res.data) {
          setSearchResults({
            restaurants: res.data.restaurants?.slice(0, 3) || [],
            dishes: res.data.foods?.slice(0, 4) || [],
          });
        }
      } catch {
        // Fallback local search
        const q = searchQuery.toLowerCase();
        setSearchResults({
          restaurants: restaurants.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 3),
          dishes: popularDishes.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 4),
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, restaurants, popularDishes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  const getItemQuantity = (dishId) => {
    const item = cartItems.find((i) => i._id === dishId || i.foodId === dishId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀</span> Super Fast 30-Min Delivery
            </div>
            <h1 className="hero-title">
              Cravings? <span>We Run.</span>
            </h1>
            <p className="hero-subtitle">
              Delicious food from your favorite restaurants, delivered fresh and hot to your doorstep. Satisfy your hunger in minutes.
            </p>
            <div className="hero-actions">
              <Link to="/restaurants" className="btn btn-primary btn-lg" id="hero-order-now-btn">
                <FiShoppingBag /> Order Now
              </Link>
              <Link to="/restaurants" className="btn btn-secondary btn-lg" id="hero-explore-btn">
                Explore Restaurants <FiArrowRight />
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">500+</span>
                <span className="stat-label">Restaurants</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">30 Min</span>
                <span className="stat-label">Avg Delivery</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">4.8★</span>
                <span className="stat-label">App Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <Hero3DStage />
          </div>
        </div>
      </section>

      {/* 2. Search Section */}
      <div className="container">
        <div className="home-search-wrap">
          <form className="home-search-bar" onSubmit={handleSearchSubmit}>
            <FiSearch style={{ color: 'var(--primary)', fontSize: '1.3rem', marginLeft: '0.25rem' }} />
            <input
              type="text"
              className="home-search-input"
              placeholder="Search for restaurants, biryani, burgers, pizza, momos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="home-search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm" id="home-search-submit-btn">
              Search
            </button>
          </form>

          {/* Live Search Preview Dropdown */}
          {searchQuery.trim().length > 0 && searchResults && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--glass-shadow), inset 0 1px 1px 0 var(--glass-highlight)',
                border: '1px solid var(--glass-border)',
                padding: '1.25rem',
                zIndex: 50,
              }}
            >
              {searchResults.restaurants?.length === 0 && searchResults.dishes?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>😋</div>
                  <p>No delicious matches found 😋</p>
                </div>
              ) : (
                <div>
                  {searchResults.restaurants?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Restaurants
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {searchResults.restaurants.map((r) => (
                          <Link
                            key={r._id}
                            to={`/restaurants/${r._id}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-alt)',
                            }}
                          >
                            <span style={{ fontWeight: '600' }}>{r.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.cuisines?.join(', ')}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.dishes?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Dishes
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {searchResults.dishes.map((d) => (
                          <Link
                            key={d._id}
                            to={`/restaurants/${d.restaurant?._id || d.restaurantId || ''}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-alt)',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: '600' }}>{d.name}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                ({d.restaurant?.name || d.restaurantName || 'Kitchen'})
                              </span>
                            </div>
                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{d.price}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Popular Cuisines Section */}
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Inspiration for your first order</h2>
              <p className="section-subtitle">Explore top trending cuisines crafted by master chefs</p>
            </div>
            <Link to="/restaurants" className="btn btn-secondary btn-sm">
              See All Cuisines <FiArrowRight />
            </Link>
          </div>

          <div className="cuisines-grid">
            {mockCuisines.map((c) => (
              <Link
                key={c.id}
                to={`/restaurants?cuisine=${encodeURIComponent(c.name)}`}
                className="cuisine-card"
              >
                <img src={c.image} alt={c.name} className="cuisine-img" loading="lazy" decoding="async" />
                <span className="cuisine-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Top Restaurants Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top Rated Restaurants</h2>
              <p className="section-subtitle">Beloved hotspots with stellar ratings and lightning-fast delivery</p>
            </div>
            <Link to="/restaurants" className="btn btn-secondary btn-sm">
              View All Restaurants <FiArrowRight />
            </Link>
          </div>

          <div className="restaurants-grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="restaurant-card">
                <Link to={`/restaurants/${restaurant._id}`} className="restaurant-img-wrap">
                  <img src={restaurant.image} alt={restaurant.name} className="restaurant-img" loading="lazy" decoding="async" />
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
      </section>

      {/* 5. Popular Dishes Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Most Loved Dishes</h2>
              <p className="section-subtitle">Top orders buzzing with reviews right now</p>
            </div>
          </div>

          <div className="dishes-grid">
            {popularDishes.map((dish) => {
              const qty = getItemQuantity(dish._id);
              const restaurantInfo = dish.restaurant || {
                _id: dish.restaurantId,
                name: dish.restaurantName || 'Popular Kitchen',
              };

              return (
                <div key={dish._id} className="dish-card">
                  <div className="dish-img-wrap">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="dish-img"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/dishes/tandoori-chicken.jpg';
                      }}
                    />
                    <span className="dish-rating-tag" aria-label={`Rating: ${dish.rating} out of 5 stars`}>
                      <FiStar className="dish-rating-star" />
                      <span>{dish.rating}</span>
                    </span>
                  </div>

                  <div className="dish-body">
                    <div className="dish-top-meta">
                      <span className={`badge ${dish.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                        {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dish.category}</span>
                    </div>

                    <h3 className="dish-title">{dish.name}</h3>
                    <div className="dish-restaurant">by {restaurantInfo.name}</div>
                    <p className="dish-desc">{dish.description}</p>

                    <div className="dish-footer">
                      <div className="dish-price">₹{dish.price}</div>

                      {qty === 0 ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => addToCart(dish, restaurantInfo)}
                          id={`add-dish-btn-${dish._id}`}
                        >
                          <FiPlus /> Add
                        </button>
                      ) : (
                        <div className="qty-stepper">
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
        </div>
      </section>

      {/* 5.5 Food-Frame Vision Interactive Sensory & DitherVeil Stage */}
      <FoodVisionStage />

      {/* 6. Special Offers Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Deals & Coupons For You</h2>
              <p className="section-subtitle">Save big on every feast with these verified promo codes</p>
            </div>
            <Link to="/offers" className="btn btn-secondary btn-sm">
              View All Offers <FiArrowRight />
            </Link>
          </div>

          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer.code} className="offer-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase' }}>
                      {offer.badge}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {offer.discount}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{offer.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{offer.desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="offer-code-pill" onClick={() => copyCoupon(offer.code)}>
                    <span>{offer.code}</span>
                    <FiCopy size={14} />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => copyCoupon(offer.code)}>
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How food spot Works */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Seamless & Effortless
          </span>
          <h2 className="section-title" style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            How food spot Works
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            From your appetite craving to the first piping hot bite in three simple steps.
          </p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-badge">1</div>
              <div className="step-icon-wrap">🍔</div>
              <h3 className="step-title">Choose Your Food</h3>
              <p className="step-desc">
                Browse hundreds of local restaurants, check verified ratings, and add mouthwatering dishes to your cart.
              </p>
            </div>

            <div className="step-card">
              <div className="step-badge">2</div>
              <div className="step-icon-wrap">💳</div>
              <h3 className="step-title">Place Your Order</h3>
              <p className="step-desc">
                Select your address, apply discounts, and pay securely using UPI, Card, or Cash on Delivery.
              </p>
            </div>

            <div className="step-card">
              <div className="step-badge">3</div>
              <div className="step-icon-wrap">🛵</div>
              <h3 className="step-title">Enjoy Your Delivery</h3>
              <p className="step-desc">
                Watch the live tracking timeline update as your meal is accepted, prepared, and dispatched in record time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', width: '100%', display: 'block' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Real Testimonials
            </span>
            <h2 className="section-title" style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>
              What Our Foodies Say
            </h2>
            <p className="section-subtitle">Thousands of happy meals delivered across town daily</p>
          </div>

          <div className="reviews-grid" style={{ marginTop: '2.5rem' }}>
            {mockReviews.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div>
                  <div style={{ color: '#F59E0B', fontSize: '1.1rem', marginBottom: '1rem' }}>
                    {'★'.repeat(rev.rating)}
                  </div>
                  <p className="review-text">"{rev.review}"</p>
                </div>

                <div className="reviewer-meta">
                  <img src={rev.avatar} alt={rev.name} className="reviewer-avatar" />
                  <div>
                    <div className="reviewer-name">{rev.name}</div>
                    <div className="reviewer-city">{rev.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. App-Download Style Banner */}
      <section className="section">
        <div className="container">
          <div className="app-banner">
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                On The Move?
              </span>
              <h2 className="app-banner-title">food spot in Your Pocket</h2>
              <p className="app-banner-desc">
                Download our award-winning food delivery app to enjoy exclusive app-only discounts, live delivery push notifications, and fast one-tap reordering.
              </p>
              <div className="app-buttons">
                <button
                  className="store-btn"
                  onClick={() => showToast('Redirecting to Google Play Store...', 'info')}
                >
                  <span style={{ fontSize: '1.5rem' }}>📱</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9CA3AF' }}>Download on</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>Google Play</div>
                  </div>
                </button>

                <button
                  className="store-btn"
                  onClick={() => showToast('Redirecting to Apple App Store...', 'info')}
                >
                  <span style={{ fontSize: '1.5rem' }}>🍏</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#9CA3AF' }}>Download on the</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>App Store</div>
                  </div>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  maxWidth: '320px',
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>⚡📦</div>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Scan to Order</h3>
                <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Point your camera at this QR code for an instant mobile web experience.
                </p>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'inline-block',
                  }}
                >
                  <div style={{ width: '130px', height: '130px', background: 'radial-gradient(circle, #333 10%, #000 90%)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: '700' }}>
                    [QR CODE]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
