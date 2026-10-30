import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiTag,
  FiArrowRight,
  FiShoppingBag,
  FiCheck,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import { getDishQuantity } from '../services/mockData';
import '../styles/cart.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    items,
    restaurant,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    deliveryFee,
    platformFee,
    tax,
    discount,
    total,
    totalItemsCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/coupons');
      if (res.success && res.data) {
        setAvailableCoupons(res.data);
      }
    } catch {
      // Ignore background coupon fetch error
    }
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      showToast('Please enter a coupon code', 'info');
      return;
    }

    try {
      setValidatingCoupon(true);
      const res = await API.post('/coupons/validate', {
        code,
        subtotal,
        userId: user?._id,
      });

      if (res.success && res.data) {
        applyCoupon(res.data);
        setCouponInput('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const freeDeliveryThreshold = 499;
  const amountNeededForFreeDel = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDelPercentage = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart-card">
            <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🛒</div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Cart is Empty</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Good food is always just around the corner. Browse our top kitchens and treat yourself to something delicious!
            </p>
            <Link to="/restaurants" className="btn btn-primary btn-lg">
              <FiShoppingBag /> Explore Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Shopping Cart ({totalItemsCount} items)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review your items, apply coupons, and checkout</p>
        </div>

        <div className="cart-layout">
          {/* Left Panel: Items List */}
          <div className="cart-items-panel">
            {/* Restaurant Info Header */}
            <div className="cart-restaurant-strip">
              <div>
                <div className="cart-restaurant-name">{restaurant?.name || 'Partner Kitchen'}</div>
                <div className="cart-restaurant-address">
                  📍 {restaurant?.address?.street || 'Bangalore'}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={clearCart}
                style={{ color: 'var(--danger)', borderColor: 'var(--border-color)' }}
              >
                <FiTrash2 /> Clear Cart
              </button>
            </div>

            {/* Free Delivery Milestone Progress */}
            <div className="free-del-progress-wrap">
              <div className="free-del-text">
                {subtotal >= freeDeliveryThreshold || coupon?.type === 'freeDelivery' ? (
                  <span>🎉 <strong>Congratulations!</strong> You unlocked FREE Delivery!</span>
                ) : (
                  <span>
                    🚀 Add <strong>₹{amountNeededForFreeDel}</strong> more to unlock <strong>FREE Delivery</strong>!
                  </span>
                )}
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${freeDelPercentage}%` }} />
              </div>
            </div>

            {/* Cart Items List */}
            <div>
              {items.map((item) => (
                <div key={item._id} className="cart-item-row">
                  <div className="cart-item-info">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-img"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Portion: <strong>{getDishQuantity(item)}</strong>
                      </div>
                      <div className="cart-item-price">
                        ₹{item.price} each <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>• Selected Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-stepper">
                      <button
                        className="qty-stepper-btn"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-stepper-btn"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <div className="cart-item-total">₹{item.price * item.quantity}</div>

                    <button
                      onClick={() => removeItem(item._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                      title="Remove item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Coupons & Bill Details */}
          <div className="bill-panel">
            {/* Coupon Card */}
            <div className="bill-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiTag style={{ color: 'var(--primary)' }} /> Offers & Promo Codes
              </h3>

              {coupon ? (
                <div className="applied-coupon-pill">
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FiCheck /> {coupon.code} Applied
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      You saved ₹{discount}!
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-input-wrap">
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="ENTER COUPON (e.g. CRAVE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApplyCoupon()}
                      disabled={validatingCoupon}
                      id="apply-coupon-btn"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {availableCoupons.length > 0 && (
                    <div>
                      <div className="available-coupons-title">Available Coupons</div>
                      {availableCoupons.map((c) => (
                        <div
                          key={c.code}
                          className="mini-coupon-card"
                          onClick={() => handleApplyCoupon(c.code)}
                        >
                          <div>
                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{c.code}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description}</div>
                          </div>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bill Summary Card */}
            <div className="bill-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Bill Details</h3>

              <div className="bill-row">
                <span>Item Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="bill-row">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              <div className="bill-row">
                <span>GST and Restaurant Charges (5%)</span>
                <span>₹{tax}</span>
              </div>

              {discount > 0 && (
                <div className="bill-row" style={{ color: 'var(--success)', fontWeight: '700' }}>
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="bill-row bill-row-total">
                <span>To Pay</span>
                <span style={{ color: 'var(--primary)' }}>₹{total}</span>
              </div>

              {discount > 0 && (
                <div className="bill-savings-strip">
                  🎉 Woohoo! You are saving ₹{discount} on this order!
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
                onClick={() => navigate('/checkout')}
                id="cart-proceed-checkout-btn"
              >
                Proceed to Checkout <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
