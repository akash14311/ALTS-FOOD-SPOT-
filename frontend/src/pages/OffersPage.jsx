import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { FiPercent, FiCopy, FiCheck, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import '../styles/home.css';

const OffersPage = () => {
  const navigate = useNavigate();
  const { applyCoupon, items } = useCart();
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get('/coupons');
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Code ${code} copied to clipboard!`, 'success');
  };

  const useCodeInCart = (coupon) => {
    applyCoupon(coupon);
    if (items.length > 0) {
      navigate('/cart');
    } else {
      showToast(`Coupon ${coupon.code} applied! Now add items to your cart.`, 'success');
      navigate('/restaurants');
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem 6rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1rem',
            }}
          >
            <FiPercent />
          </div>
          <h1 style={{ fontSize: '2.4rem' }}>Deals & Promo Offers</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0.5rem auto 0' }}>
            Enjoy unbelievable discounts on your favorite cravings. Copy and apply anytime during checkout!
          </p>
        </div>

        {loading ? (
          <div className="offers-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <h3>No active coupons at this time</h3>
          </div>
        ) : (
          <div className="offers-grid">
            {coupons.map((c) => (
              <div key={c._id || c.code} className="offer-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--accent)',
                        textTransform: 'uppercase',
                        backgroundColor: 'var(--accent-light)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {c.code === 'FIRST50' ? 'Welcome Offer' : 'Verified Coupon'}
                    </span>
                    <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {c.type === 'percent' ? `${c.value}% OFF` : c.type === 'freeDelivery' ? 'FREE DELIVERY' : `₹${c.value} OFF`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{c.code}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {c.description}
                  </p>

                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    • Min order: ₹{c.minOrder || 0}
                    {c.maxDiscount ? ` • Max discount: ₹${c.maxDiscount}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => copyCode(c.code)}
                  >
                    <FiCopy /> Copy
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1.2 }}
                    onClick={() => useCodeInCart(c)}
                  >
                    Apply Now <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
