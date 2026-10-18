import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
  FiPlus,
  FiShoppingBag,
  FiLock,
  FiShield,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi';
import UpiQrModal, { UPI_PROVIDERS } from '../components/checkout/UpiQrModal';
import '../styles/checkout.css';
import '../styles/upiPayment.css';

const QrIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <line x1="6.5" y1="6.5" x2="6.51" y2="6.5" strokeWidth="3" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3" />
    <line x1="6.5" y1="17.5" x2="6.51" y2="17.5" strokeWidth="3" />
    <line x1="17.5" y1="17.5" x2="17.51" y2="17.5" strokeWidth="3" />
  </svg>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    items,
    restaurant,
    coupon,
    subtotal,
    deliveryFee,
    platformFee,
    tax,
    discount,
    total,
    totalItemsCount,
    clearCart,
  } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    mobile: user?.mobile || '',
    houseNo: '',
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'COD' | 'UPI' | 'CARD'
  const [upiMode, setUpiMode] = useState('QR'); // 'QR' | 'VPA'
  const [selectedAppId, setSelectedAppId] = useState('all');
  const [upiId, setUpiId] = useState('rahul@okhdfcbank');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [previewQrUrl, setPreviewQrUrl] = useState('');

  const activeProvider =
    UPI_PROVIDERS.find((p) => p.id === selectedAppId) || UPI_PROVIDERS[0];

  const [cardData, setCardData] = useState({
    number: '4532 8921 7382 9102',
    name: user?.name || 'Rahul Sharma',
    expiry: '12/28',
    cvv: '821',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Generate lightweight inline preview QR whenever total or selected app changes
  useEffect(() => {
    const vpa = activeProvider.vpa;
    const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
      'food spot'
    )}&am=${Number(total).toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      `food spot - ${activeProvider.name}`
    )}`;

    QRCode.toDataURL(upiUri, {
      width: 180,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setPreviewQrUrl(url))
      .catch((err) => console.error('Failed to generate preview QR:', err));
  }, [total, selectedAppId]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await API.get('/users/addresses');
      if (res.success && res.data?.length > 0) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        setSelectedAddressId(defaultAddr._id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.warn('Addresses fetch error:', err);
      setShowNewAddressForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.mobile || !newAddress.street || !newAddress.city || !newAddress.pincode) {
      showToast('Please fill all address fields', 'error');
      return;
    }

    if (!/^\d{10}$/.test(newAddress.mobile.trim())) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    if (!/^\d{6}$/.test(newAddress.pincode.trim())) {
      showToast('Please enter a valid 6-digit postal pincode', 'error');
      return;
    }

    try {
      const res = await API.post('/users/addresses', newAddress);
      if (res.success && res.data) {
        setAddresses([...addresses, res.data]);
        setSelectedAddressId(res.data._id);
        setShowNewAddressForm(false);
        showToast('Address saved successfully', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const validateAddress = () => {
    let finalAddress = null;
    if (showNewAddressForm) {
      if (!newAddress.fullName || !newAddress.mobile || !newAddress.street || !newAddress.pincode) {
        showToast('Please enter complete delivery address details', 'error');
        return null;
      }
      finalAddress = newAddress;
    } else {
      finalAddress = addresses.find((a) => a._id === selectedAddressId);
      if (!finalAddress) {
        showToast('Please select a delivery address', 'error');
        return null;
      }
    }
    return finalAddress;
  };

  const handleInitialProceed = () => {
    const finalAddress = validateAddress();
    if (!finalAddress) return;

    if (paymentMethod === 'UPI' && upiMode === 'QR') {
      setShowUpiModal(true);
      return;
    }

    handlePlaceOrder();
  };

  const handlePlaceOrder = async (skipUpiValidation = false) => {
    const finalAddress = validateAddress();
    if (!finalAddress) return;

    // Payment validation
    if (paymentMethod === 'UPI' && !skipUpiValidation) {
      if (upiMode === 'QR') {
        setShowUpiModal(true);
        return;
      }
      if (!upiId.includes('@') || upiId.length < 5) {
        showToast('Please enter a valid UPI ID (e.g. username@bank)', 'error');
        return;
      }
    } else if (paymentMethod === 'CARD') {
      const cleanNum = cardData.number.replace(/\s+/g, '');
      if (cleanNum.length !== 16) {
        showToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
      if (cardData.cvv.length < 3) {
        showToast('Please enter a valid 3-digit CVV', 'error');
        return;
      }
    }

    try {
      setIsProcessing(true);

      // Short simulation delay
      await new Promise((resolve) => setTimeout(resolve, skipUpiValidation ? 800 : 1800));

      const orderPayload = {
        restaurantId: restaurant?._id || restaurant?.id,
        items: items.map((i) => ({
          foodId: i.foodId || i._id || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          isVeg: i.isVeg,
        })),
        address: {
          fullName: finalAddress.fullName,
          mobile: finalAddress.mobile,
          houseNo: finalAddress.houseNo || '1',
          street: finalAddress.street,
          city: finalAddress.city,
          state: finalAddress.state || 'Karnataka',
          pincode: finalAddress.pincode,
        },
        paymentMethod,
        couponCode: coupon?.code || null,
      };

      const res = await API.post('/orders', orderPayload);

      if (res.success && res.data) {
        setShowUpiModal(false);
        clearCart();
        showToast('Order placed successfully! 🚀', 'success');
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err) {
      setIsProcessing(false);
      showToast(err.message || 'Failed to place order', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2>Your cart is empty</h2>
        <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Navigation Back Button to Cart / Previous Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="checkout-back-nav-btn"
            onClick={() => navigate('/cart')}
            title="Return to Cart"
          >
            <FiArrowLeft size={16} />
            <span>Back to Cart</span>
          </button>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Checkout & Payment</h1>
          <p style={{ color: 'var(--text-muted)' }}>Confirm your delivery destination and simulated payment</p>
        </div>

        <div className="checkout-grid">
          {/* Left Column: Delivery Address & Payment Method */}
          <div>
            {/* Step 1: Delivery Address */}
            <div className="checkout-step-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 className="step-heading">
                  <FiMapPin style={{ color: 'var(--primary)' }} /> 1. Delivery Address
                </h2>
                {!showNewAddressForm && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    <FiPlus /> Add New Address
                  </button>
                )}
              </div>

              {!showNewAddressForm ? (
                <div className="address-cards-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`address-select-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr._id)}
                    >
                      {selectedAddressId === addr._id && (
                        <FiCheckCircle
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            color: 'var(--primary)',
                            fontSize: '1.2rem',
                          }}
                        />
                      )}
                      <div className="address-recipient-name">
                        {addr.fullName} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({addr.mobile})</span>
                      </div>
                      <div className="address-text">
                        {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSaveNewAddress} style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Enter Complete Delivery Address</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">10-Digit Mobile *</label>
                      <input
                        type="tel"
                        maxLength="10"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.mobile}
                        onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Flat / House No.</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.houseNo}
                        onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                        placeholder="A-402, Sunshine Apts"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Street Address & Landmark *</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="12th Main, Koramangala 4th Block"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Pincode *</label>
                      <input
                        type="text"
                        maxLength="6"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save & Use This Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowNewAddressForm(false)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FiArrowLeft size={14} />
                        <span>Back to Saved Addresses</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="checkout-step-card">
              <h2 className="step-heading">
                <FiCreditCard style={{ color: 'var(--primary)' }} /> 2. Payment Method
              </h2>

              <div className="payment-methods-list">
                {/* UPI Option */}
                <div
                  className={`payment-method-row ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <div className="payment-row-header">
                    <label className="payment-radio-label">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                      />
                      <span>⚡ Instant UPI (Google Pay, PhonePe, Paytm, QR)</span>
                    </label>
                    <span style={{ fontSize: '1.25rem' }}>📱</span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="payment-form-subbox" onClick={(e) => e.stopPropagation()}>
                      {/* Mode Selector Tabs */}
                      <div className="upi-inline-tabs">
                        <button
                          type="button"
                          className={`upi-inline-tab-btn ${upiMode === 'QR' ? 'active' : ''}`}
                          onClick={() => setUpiMode('QR')}
                        >
                          <QrIcon size={16} />
                          <span>Scan QR Code (Recommended)</span>
                        </button>
                        <button
                          type="button"
                          className={`upi-inline-tab-btn ${upiMode === 'VPA' ? 'active' : ''}`}
                          onClick={() => setUpiMode('VPA')}
                        >
                          <span>Enter UPI ID / VPA</span>
                        </button>
                      </div>

                      {upiMode === 'QR' ? (
                        <div className="upi-inline-qr-card">
                          <div className="upi-inline-qr-thumb">
                            {previewQrUrl ? (
                              <img key={selectedAppId} src={previewQrUrl} alt="UPI QR Thumbnail" />
                            ) : (
                              <div style={{ fontSize: '0.7rem' }}>Generating QR...</div>
                            )}
                          </div>
                          <div className="upi-inline-qr-details">
                            <h4 className="upi-inline-qr-title">
                              Scan & Pay ₹{total} via {activeProvider.name}
                            </h4>
                            <p className="upi-inline-qr-desc">
                              {activeProvider.instruction}
                            </p>

                            {/* Selectable App Buttons */}
                            <div className="upi-app-selector-title">
                              <span>Choose UPI App:</span>
                            </div>
                            <div className="upi-supported-apps" style={{ justifyContent: 'flex-start' }}>
                              {UPI_PROVIDERS.map((provider) => {
                                const isSelected = selectedAppId === provider.id;
                                return (
                                  <button
                                    key={provider.id}
                                    type="button"
                                    className={`upi-app-btn ${isSelected ? 'active' : ''}`}
                                    style={{
                                      borderColor: isSelected ? provider.themeColor : undefined,
                                      color: isSelected ? '#ffffff' : provider.themeColor,
                                      background: isSelected ? provider.themeColor : undefined
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAppId(provider.id);
                                    }}
                                  >
                                    {provider.shortName}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              className="upi-open-modal-trigger"
                              onClick={handleInitialProceed}
                            >
                              <QrIcon size={16} />
                              <span>Open Fullscreen QR ({activeProvider.shortName})</span>
                              <FiArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="form-label">Enter Virtual Payment Address (UPI ID)</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '1rem' }}
                            placeholder="yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
                            ✓ Format validated instantly. Collect request will be sent to your UPI app.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Option */}
                <div
                  className={`payment-method-row ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <div className="payment-row-header">
                    <label className="payment-radio-label">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                      />
                      <span>💳 Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                    </label>
                    <span style={{ fontSize: '1.25rem' }}>🔒</span>
                  </div>

                  {paymentMethod === 'CARD' && (
                    <div className="payment-form-subbox" onClick={(e) => e.stopPropagation()}>
                      <div className="form-group">
                        <label className="form-label">Card Number (16 Digits)</label>
                        <input
                          type="text"
                          maxLength="19"
                          className="form-input"
                          style={{ paddingLeft: '1rem' }}
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            maxLength="5"
                            className="form-input"
                            style={{ paddingLeft: '1rem' }}
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV (3 Digits)</label>
                          <input
                            type="password"
                            maxLength="3"
                            className="form-input"
                            style={{ paddingLeft: '1rem' }}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery Option */}
                <div
                  className={`payment-method-row ${paymentMethod === 'COD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="payment-row-header">
                    <label className="payment-radio-label">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                      />
                      <span>💵 Cash on Delivery (Pay at Doorstep)</span>
                    </label>
                    <span style={{ fontSize: '1.25rem' }}>🛵</span>
                  </div>
                  {paymentMethod === 'COD' && (
                    <div className="payment-form-subbox" onClick={(e) => e.stopPropagation()}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Please keep exact cash handy for hassle-free doorstep delivery.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div className="bill-panel">
            <div className="bill-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Order Summary</h3>

              {/* Items Snapshot */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '4px' }}>
                {items.map((i) => (
                  <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-main)' }}>
                      {i.quantity}x {i.name}
                    </span>
                    <span style={{ fontWeight: '600' }}>₹{i.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div className="bill-row">
                  <span>Item Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="bill-row">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="bill-row">
                  <span>Taxes (5% GST)</span>
                  <span>₹{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="bill-row" style={{ color: 'var(--success)', fontWeight: '700' }}>
                    <span>Coupon Savings</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="bill-row bill-row-total">
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>₹{total}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1.5rem' }}
                onClick={handleInitialProceed}
                disabled={isProcessing}
                id="place-order-submit-btn"
              >
                <FiLock /> {paymentMethod === 'UPI' && upiMode === 'QR' ? `Scan QR & Pay ₹${total}` : `Pay ₹${total} & Place Order`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                <FiShield /> 100% Secure Simulated Transaction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Processing Modal for Card & COD */}
      {isProcessing && !showUpiModal && (
        <div className="modal-overlay">
          <div className="modal-content payment-processing-modal">
            <div className="payment-spinner" />
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Processing Payment...</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Communicating securely with {paymentMethod === 'CARD' ? 'Bank Gateway' : 'Order Server'}. Please do not refresh.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setIsProcessing(false)}
            >
              <FiArrowLeft size={15} />
              <span>Cancel & Return to Payment Options</span>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Interactive UPI QR Code Payment Modal */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        total={total}
        restaurantName={restaurant?.name || 'food spot'}
        onPaymentSuccess={() => handlePlaceOrder(true)}
        isProcessing={isProcessing}
        initialApp={selectedAppId}
      />
    </div>
  );
};

export default CheckoutPage;
