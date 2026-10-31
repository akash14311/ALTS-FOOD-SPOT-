import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiLogOut,
  FiShoppingBag,
  FiArrowLeft,
  FiX,
  FiHome,
  FiNavigation,
  FiCompass,
  FiHash,
} from 'react-icons/fi';
import '../styles/auth.css';
import '../styles/deliveryAddress.css';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Escape key to dismiss address modal
  useEffect(() => {
    if (!showAddressModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddressModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddressModal]);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    mobile: '',
    houseNo: '',
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    isDefault: false,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAddresses();
    fetchRecentOrders();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await API.get('/users/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch {
      // Ignore background address error
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await API.get('/orders');
      if (res.success && res.data) {
        setRecentOrders(res.data.slice(0, 3));
      }
    } catch {
      // Ignore background order error
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfile({ name, mobile, avatar });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || '',
      mobile: user?.mobile || '',
      houseNo: '',
      street: '',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      mobile: addr.mobile,
      houseNo: addr.houseNo,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(addressForm.mobile.trim())) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return;
    }

    try {
      if (editingAddressId) {
        await API.put(`/users/addresses/${editingAddressId}`, addressForm);
        showToast('Address updated successfully', 'success');
      } else {
        await API.post('/users/addresses', addressForm);
        showToast('Address saved to address book', 'success');
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await API.delete(`/users/addresses/${id}`);
      showToast('Address removed', 'info');
      fetchAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await API.put(`/users/addresses/${id}`, { isDefault: true });
      showToast('Default delivery address updated', 'success');
      fetchAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem 6rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>My Profile</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage account details, delivery addresses, and personal settings</p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--danger)', borderColor: 'var(--border-color)' }}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <FiLogOut /> Log Out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Column: Personal Info Form */}
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: '800',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{user?.name}</h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: user?.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    backgroundColor: user?.role === 'admin' ? 'var(--primary-light)' : 'var(--bg-alt)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {user?.role === 'admin' ? '🛡️ Administrator' : '👤 Verified Foodie'}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-wrapper">
                  <FiUser className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Email Address</label>
                  {user?.isEmailVerified ? (
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiCheck /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700' }}>
                      ⚠️ Unverified
                    </span>
                  )}
                </div>
                <div className="form-input-wrapper">
                  <FiMail className="form-input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Mobile Number</label>
                  {user?.isMobileVerified ? (
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiCheck /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700' }}>
                      ⚠️ Unverified
                    </span>
                  )}
                </div>
                <div className="phone-input-combo">
                  <span className="phone-country-code">🇮🇳 +91</span>
                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving Changes...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Right Column: Address Book & Recent Orders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Address Book */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiMapPin style={{ color: 'var(--primary)' }} /> Saved Delivery Addresses
                </h3>
                <button className="btn btn-outline btn-sm" onClick={handleOpenAddAddress}>
                  <FiPlus /> Add New
                </button>
              </div>

              {loadingAddresses ? (
                <div className="skeleton" style={{ height: '100px' }} />
              ) : addresses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No saved addresses yet. Add one to make checkout effortless!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: addr.isDefault ? 'var(--primary-light)' : 'var(--bg-alt)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <div>
                          <strong>{addr.fullName}</strong>
                          {addr.isDefault && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', marginLeft: '0.5rem' }}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.street}, {addr.city} - {addr.pincode}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        📞 {addr.mobile}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Card */}
            {recentOrders.length > 0 && (
              <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiShoppingBag style={{ color: 'var(--primary)' }} /> Recent Orders
                  </h3>
                  <Link to="/orders" className="btn btn-secondary btn-sm">
                    View All
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentOrders.map((o) => (
                    <Link
                      key={o._id}
                      to={`/orders/${o._id}`}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-alt)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{o.restaurant?.name || 'Order'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(o.createdAt).toLocaleDateString()} • ₹{o.total}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {o.status} →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Add / Edit Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.3rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setShowAddressModal(false)}
                  title="Back to Addresses"
                >
                  <FiArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <h3 style={{ margin: 0 }}>
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ padding: 0, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowAddressModal(false)}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon" />
                    <input
                      type="text"
                      className="form-input address-form-input"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    10-Digit Mobile <span className="required-star">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <FiPhone className="form-input-icon" />
                    <input
                      type="tel"
                      maxLength="10"
                      className="form-input address-form-input"
                      value={addressForm.mobile}
                      onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">House / Flat / Building No.</label>
                <div className="form-input-wrapper">
                  <FiHome className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input address-form-input"
                    value={addressForm.houseNo}
                    onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                    placeholder="e.g. Flat 402, Sunshine Apts"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Street / Colony / Landmark <span className="required-star">*</span>
                </label>
                <div className="form-input-wrapper">
                  <FiMapPin className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input address-form-input"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="e.g. 12th Main Road, Near Sony Signal"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    City <span className="required-star">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <FiNavigation className="form-input-icon" />
                    <input
                      type="text"
                      className="form-input address-form-input"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="e.g. Bangalore"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <div className="form-input-wrapper">
                    <FiCompass className="form-input-icon" />
                    <input
                      type="text"
                      className="form-input address-form-input"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pincode (6 digits) <span className="required-star">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <FiHash className="form-input-icon" />
                    <input
                      type="text"
                      maxLength="6"
                      className="form-input address-form-input"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 560034"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="default-check"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                />
                <label htmlFor="default-check" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Make this my default delivery address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddressModal(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <FiArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingAddressId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
