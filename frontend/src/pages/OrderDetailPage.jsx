import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  FiCheck,
  FiClock,
  FiMapPin,
  FiCreditCard,
  FiAlertTriangle,
  FiArrowLeft,
  FiRefreshCw,
  FiPhone,
  FiMessageSquare,
  FiStar,
  FiHelpCircle,
  FiShield,
  FiPhoneCall,
  FiNavigation,
  FiGift,
  FiCheckCircle,
  FiActivity,
  FiMinimize2,
  FiMaximize2,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import CustomerSupportModal from '../components/tracking/CustomerSupportModal';
import RiderContactModal from '../components/tracking/RiderContactModal';
import '../styles/tracking.css';

const STAGES = [
  {
    key: 'Placed',
    stepNumber: '01',
    label: 'Order Placed',
    icon: '📝',
    desc: 'Restaurant received your order and acknowledged items',
    estimatedMins: '0m',
  },
  {
    key: 'Accepted',
    stepNumber: '02',
    label: 'Order Confirmed',
    icon: '👨‍🍳',
    desc: 'Kitchen verified ingredients and assigned prep station',
    estimatedMins: '3m',
  },
  {
    key: 'Preparing',
    stepNumber: '03',
    label: 'Food Preparing',
    icon: '🍳',
    desc: 'Chef is seasoning, cooking, and sealing your hot meal',
    estimatedMins: '15m',
  },
  {
    key: 'Out for Delivery',
    stepNumber: '04',
    label: 'Out for Delivery',
    icon: '🛵',
    desc: 'Courier partner picked up package and is heading to you',
    estimatedMins: '25m',
  },
  {
    key: 'Delivered',
    stepNumber: '05',
    label: 'Order Delivered',
    icon: '🎉',
    desc: 'Package delivered safely at your doorstep. Enjoy your meal!',
    estimatedMins: '35m',
  },
];

// Isolated countdown badge to eliminate full-page root re-renders every 1000ms
const SyncCountdownText = React.memo(({ onTriggerFetch, isRefreshing, isCancelled, isDelivered, resetCount }) => {
  const [sec, setSec] = useState(10);

  useEffect(() => {
    setSec(10);
  }, [resetCount]);

  useEffect(() => {
    if (isDelivered || isCancelled) return;
    const t = setInterval(() => {
      setSec((prev) => {
        if (prev <= 1) {
          onTriggerFetch();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isDelivered, isCancelled, onTriggerFetch]);

  if (isRefreshing) return 'Syncing...';
  if (isCancelled) return 'Cancelled';
  if (isDelivered) return 'Delivered';
  return <>Sync in <strong>{sec}s</strong></>;
});

const OrderDetailPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compactable UI Modes
  const [isTimelineCompact, setIsTimelineCompact] = useState(true);
  const [itemsCollapsed, setItemsCollapsed] = useState(false);
  const [supportCollapsed, setSupportCollapsed] = useState(false);

  // Modals state
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState('chat');
  const [riderModalOpen, setRiderModalOpen] = useState(false);
  const [selectedMilestoneKey, setSelectedMilestoneKey] = useState(null);

  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  // Initial load
  useEffect(() => {
    fetchOrder(true);
  }, [id]);

  const handleAutoPoll = useCallback(() => {
    const currentOrder = orderRef.current;
    if (currentOrder && ['Delivered', 'Cancelled'].includes(currentOrder.status)) return;
    fetchOrder(false, false);
  }, [id]);

  const fetchOrder = async (showLoading = true, isManual = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const res = await API.get(`/orders/${id}`, { skipCache: true });
      if (res.success && res.data) {
        const prevStatus = orderRef.current?.status;
        const newStatus = res.data.status;

        setOrder(res.data);

        // Notify user if status updated
        if (prevStatus && prevStatus !== newStatus) {
          showToast(`Order status updated to: ${newStatus}!`, 'success');
        } else if (isManual) {
          showToast('Delivery status is up to date', 'info');
        }
      }
    } catch (err) {
      if (showLoading || isManual) {
        showToast(err.message, 'error');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    }
  };

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    setResetCount((c) => c + 1);
    fetchOrder(false, true);
  };

  const handleOpenSupport = (tab = 'chat') => {
    setSupportInitialTab(tab);
    setSupportModalOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const res = await API.put(`/orders/${id}/cancel`);
      if (res.success && res.data) {
        setOrder(res.data);
        showToast('Order cancelled successfully', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container tracking-page" style={{ maxWidth: '1060px' }}>
        <div className="skeleton futuristic-glow-card" style={{ height: '140px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
        <div className="skeleton futuristic-glow-card" style={{ height: '320px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
        <div className="skeleton futuristic-glow-card" style={{ height: '220px', borderRadius: 'var(--radius-xl)', marginBottom: '2rem' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2>Order not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const currentStageIndex = STAGES.findIndex((s) => s.key === order.status);
  const progressPercent = isCancelled ? 0 : Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100);

  // Can cancel only while Placed or Accepted
  const canCancel = ['Placed', 'Accepted'].includes(order.status);

  return (
    <div className="tracking-page">
      <div className="container" style={{ maxWidth: '1060px' }}>
        {/* Navigation & Command Support Header */}
        <div className="tracking-top-nav-row">
          <Link to="/orders" className="btn btn-secondary btn-sm nav-back-btn">
            <FiArrowLeft /> Back to All Orders
          </Link>

          {/* Quick Support Command Bar Pills */}
          <div className="quick-support-command-pills">
            <button
              type="button"
              className="support-command-pill pill-chat"
              onClick={() => handleOpenSupport('chat')}
              title="Chat live with order concierge"
            >
              <FiMessageSquare size={13} /> Chat with Us
            </button>
            <button
              type="button"
              className="support-command-pill pill-delays"
              onClick={() => handleOpenSupport('delays')}
              title="Track delays and claim guarantee"
            >
              <FiClock size={13} /> Delivery Delays
            </button>
            <button
              type="button"
              className="support-command-pill pill-issues"
              onClick={() => handleOpenSupport('issues')}
              title="Report missing order or damage"
            >
              <FiAlertTriangle size={13} /> Order Issues
            </button>
            <button
              type="button"
              className="support-command-pill pill-reviews"
              onClick={() => handleOpenSupport('reviews')}
              title="Rate your culinary experience"
            >
              <FiStar size={13} /> Review Meal
            </button>
            <button
              type="button"
              className="support-command-pill pill-drawbacks"
              onClick={() => handleOpenSupport('drawbacks')}
              title="Report website bugs or drawbacks"
            >
              <FiHelpCircle size={13} /> Website Feedback
            </button>
          </div>
        </div>

        {/* Top Order Overview Banner with Glowing Cybernetic Borders */}
        <div className="tracking-header title-card-glossy futuristic-glow-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="order-id-badge">
                ORDER #{order._id.slice(-6).toUpperCase()}
              </span>
              <span
                className={`order-status-pill ${
                  isCancelled
                    ? 'status-cancelled'
                    : order.status === 'Delivered'
                    ? 'status-delivered'
                    : 'status-active'
                }`}
              >
                <span className="pulsing-beacon-dot" /> {order.status.toUpperCase()}
              </span>
              <span className="order-live-telemetry-tag">
                <FiActivity size={12} /> Live Satellite Sync Active
              </span>
            </div>
            <h1 className="tracking-restaurant-title">{order.restaurant?.name || 'Restaurant Order'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!isCancelled && order.status !== 'Delivered' && (
              <div className="tracking-eta-box glow-eta">
                <div className="eta-label">Estimated Arrival</div>
                <div className="eta-time">25-30 Mins</div>
                <div className="eta-sub">On-Time Guarantee Active</div>
              </div>
            )}

            {canCancel && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Live Delivery Partner Mission Card */}
        {!isCancelled && (
          <div className="rider-mission-banner title-card-glossy futuristic-glow-card">
            <div className="rider-banner-left">
              <div className="rider-avatar-ring">
                <span>👨‍✈️</span>
                <span className="rider-online-dot" />
              </div>
              <div>
                <div className="rider-badge-row">
                  <span className="rider-name-title">Rahul Verma</span>
                  <span className="rider-tier-badge">Elite Courier • 4.9 ★</span>
                  <span className="rider-ev-badge">Ather 450X EV</span>
                </div>
                <div className="rider-meta-sub">
                  <FiShield size={12} style={{ color: '#10B981' }} /> Sanitized Thermal Bag • 100% Vaccinated • 1,420+ Safe Deliveries
                </div>
              </div>
            </div>

            <div className="rider-banner-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm rider-action-btn"
                onClick={() => setRiderModalOpen(true)}
              >
                <FiPhoneCall size={14} /> Call Partner
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm rider-action-btn"
                onClick={() => setRiderModalOpen(true)}
              >
                <FiNavigation size={14} /> Drop-off Notes
              </button>
            </div>
          </div>
        )}

        {/* Compact & Advanced Live Delivery Status Timeline */}
        <div className="timeline-card compact-timeline-card title-card-glossy futuristic-glow-card">
          {/* Integrated Compact Header */}
          <div className="timeline-compact-header">
            <div className="compact-header-left">
              <div className="compact-phase-avatar">
                <span>{STAGES.find((s) => s.key === order.status)?.icon || '📦'}</span>
                <span className="compact-pulse-ring" />
              </div>
              <div>
                <div className="compact-title-row">
                  <h2 className="compact-stage-title">
                    {order.status === 'Delivered'
                      ? 'Order Delivered!'
                      : STAGES.find((s) => s.key === order.status)?.label || order.status}
                  </h2>
                  <span className={`compact-stage-badge ${order.status === 'Delivered' ? 'delivered' : 'active'}`}>
                    STAGE {Math.max(1, currentStageIndex + 1)} OF 5
                  </span>
                  <span className="compact-live-dot" title="Live Auto-Sync Active" />
                </div>
                <p className="compact-stage-narrative">
                  {order.statusHistory?.slice(-1)[0]?.note ||
                    STAGES.find((s) => s.key === order.status)?.desc ||
                    'Order progressing normally'}
                </p>
              </div>
            </div>

            <div className="compact-header-right">
              {/* Progress Bar & Stat */}
              <div className="compact-progress-pill">
                <div className="progress-pill-meta">
                  <span className="progress-pill-label">Progress</span>
                  <span className="progress-pill-val">{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress-pill-track">
                  <div className="progress-pill-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Sync Button */}
              <button
                type="button"
                id="refresh-delivery-status-btn"
                className={`live-refresh-chip compact-chip ${isRefreshing ? 'is-refreshing' : ''} ${isCancelled || order.status === 'Delivered' ? 'is-terminal' : ''}`}
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Click to sync delivery status immediately"
                aria-label="Refresh live delivery status"
              >
                <FiRefreshCw className={`refresh-symbol ${isRefreshing ? 'spin-fast' : ''}`} size={12} />
                <span className="refresh-status-text">
                  <SyncCountdownText
                    onTriggerFetch={handleAutoPoll}
                    isRefreshing={isRefreshing}
                    isCancelled={isCancelled}
                    isDelivered={order.status === 'Delivered'}
                    resetCount={resetCount}
                  />
                </span>
                {!['Delivered', 'Cancelled'].includes(order.status) && !isRefreshing && (
                  <span className="compact-sync-label">Sync</span>
                )}
              </button>

              {/* Compact Mode Toggle */}
              {!['Delivered', 'Cancelled'].includes(order.status) && (
                <button
                  type="button"
                  className="compact-toggle-btn"
                  onClick={() => setIsTimelineCompact(!isTimelineCompact)}
                  title={isTimelineCompact ? 'Switch to detailed milestone view' : 'Switch to compact stepper'}
                >
                  {isTimelineCompact ? (
                    <>
                      <FiMaximize2 size={12} /> Detailed
                    </>
                  ) : (
                    <>
                      <FiMinimize2 size={12} /> Compact
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {isCancelled ? (
            <div className="order-cancelled-box compact-cancelled">
              <FiAlertTriangle size={24} />
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--danger)', marginBottom: '0.1rem' }}>Order Cancelled</h4>
                <p style={{ fontSize: '0.8rem' }}>Refund initiated to simulated source within 2-3 business days.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Prominent High-Visibility Live Route Stepper with Snug Stations */}
              <div className="delivery-route-track-container">
                {/* Prominent Illuminated Cybernetic Track Rail */}
                <div className="prominent-track-rail">
                  <div className="track-rail-channel" />
                  <div
                    className="track-rail-glow-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="track-rail-laser-stream"
                    style={{ width: `${progressPercent}%` }}
                  />
                  {/* Active Courier Runner Pod riding on top of the glowing track */}
                  {order.status !== 'Delivered' && (
                    <div
                      className="prominent-runner-pod"
                      style={{ left: `calc(10% + (${progressPercent} * 0.8%) - 18px)` }}
                      title={`Active: ${order.status}`}
                    >
                      <span className="runner-pod-avatar">
                        {order.status === 'Out for Delivery' ? '🛵' : '⚡'}
                      </span>
                      <span className="runner-pod-halo" />
                    </div>
                  )}
                </div>

                {/* 5 Milestone Station Nodes with Snug, Space-Optimized Boxes */}
                <div className="milestone-stations-grid">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const historyMatch = order.statusHistory?.find((h) => h.status === stage.key);
                    const isSelected = selectedMilestoneKey === stage.key;

                    return (
                      <div
                        key={stage.key}
                        className={`milestone-station ${
                          isCompleted ? 'is-completed' : isCurrent ? 'is-current' : 'is-pending'
                        } ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setSelectedMilestoneKey(selectedMilestoneKey === stage.key ? null : stage.key)}
                        role="button"
                        tabIndex={0}
                        title={`Click to inspect details for ${stage.label}`}
                      >
                        <div className="milestone-bubble-sphere">
                          {isCompleted ? <FiCheck size={15} /> : stage.icon}
                          {isCurrent && <span className="bubble-active-ping" />}
                        </div>
                        <div className="milestone-snug-box">
                          <span className="milestone-title">{stage.label}</span>
                          <span className="milestone-meta">
                            {isCompleted
                              ? historyMatch?.at
                                ? new Date(historyMatch.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Done ✓'
                              : isCurrent
                              ? 'Active ⚡'
                              : stage.estimatedMins}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Stage Detail Drawer (Compact) */}
              {selectedMilestoneKey && (
                <div className="selected-stage-drawer compact-drawer">
                  <div className="drawer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{STAGES.find((s) => s.key === selectedMilestoneKey)?.icon}</span>
                      <strong style={{ fontSize: '0.9rem' }}>{STAGES.find((s) => s.key === selectedMilestoneKey)?.label}</strong>
                      <span className="drawer-stage-badge">
                        {order.statusHistory?.some((h) => h.status === selectedMilestoneKey) ? 'LOGGED' : 'PENDING'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="drawer-close-btn"
                      onClick={() => setSelectedMilestoneKey(null)}
                    >
                      ✕ Close
                    </button>
                  </div>
                  <p className="drawer-desc" style={{ fontSize: '0.82rem' }}>
                    {order.statusHistory?.find((h) => h.status === selectedMilestoneKey)?.note ||
                      STAGES.find((s) => s.key === selectedMilestoneKey)?.desc}
                  </p>
                </div>
              )}

              {/* Compact Event Log Stream (Clean Single-Line Ticker) */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="compact-event-ticker">
                  <span className="ticker-label">
                    <FiActivity size={12} /> LIVE STREAM
                  </span>
                  <span className="ticker-time">
                    {new Date(order.statusHistory.slice(-1)[0].at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="ticker-badge">{order.statusHistory.slice(-1)[0].status}</span>
                  <span className="ticker-note">{order.statusHistory.slice(-1)[0].note}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Details Grid with Futuristic Glow Cards */}
        <div className="order-details-grid">
          {/* Items Snapshot Card (Compactable) */}
          <div className="order-info-card title-card-glossy futuristic-glow-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: itemsCollapsed ? '0.65rem' : '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>📦</span> Items Ordered ({order.items?.length || 0})
              </h3>
              <button
                type="button"
                className="compact-toggle-btn"
                onClick={() => setItemsCollapsed(!itemsCollapsed)}
                title={itemsCollapsed ? 'Expand items breakdown' : 'Collapse items list'}
              >
                {itemsCollapsed ? (
                  <>
                    <FiChevronDown size={13} /> View Items
                  </>
                ) : (
                  <>
                    <FiChevronUp size={13} /> Collapse
                  </>
                )}
              </button>
            </div>

            {!itemsCollapsed ? (
              <div className="order-items-glossy-grid">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="tracking-order-item-card item-card-glossy">
                    <div className="item-card-main-info">
                      <span className={`badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'} item-dietary-badge`}>
                        {item.isVeg ? '●' : '▲'}
                      </span>
                      <div className="item-details-stack">
                        <div className="item-card-title">{item.name}</div>
                        <div className="item-card-qty-pill">
                          Qty: <span className="qty-count">{item.quantity}</span> × ₹{item.price}
                        </div>
                      </div>
                    </div>
                    <div className="item-card-price-tag">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="compact-item-summary-strip item-card-glossy" onClick={() => setItemsCollapsed(false)}>
                <span>{order.items?.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{order.subtotal}</span>
              </div>
            )}

            {/* Bill Summary */}
            <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '1rem', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                <span>Platform Fee</span>
                <span>₹{order.platformFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                <span>GST (5%)</span>
                <span>₹{order.tax}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--success)', fontWeight: '700' }}>
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="order-info-card title-card-glossy futuristic-glow-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMapPin style={{ color: 'var(--primary)' }} /> Delivery Address
              </h3>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{order.address?.fullName}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '0.25rem' }}>
                {order.address?.houseNo ? `${order.address.houseNo}, ` : ''}{order.address?.street},{' '}
                {order.address?.city} - {order.address?.pincode}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiPhone size={14} /> {order.address?.mobile}
              </div>
            </div>

            <div className="order-info-card title-card-glossy futuristic-glow-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCreditCard style={{ color: 'var(--primary)' }} /> Payment Details
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Method</span>
                <span style={{ fontWeight: '700' }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ color: order.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)', fontWeight: '700' }}>
                  ● {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Customer Service Command Hub - Placed as Last Block on Page (Compactable) */}
        <div className="support-command-hub title-card-glossy futuristic-glow-card">
          <div className="command-hub-header">
            <div>
              <h3 className="command-hub-title">
                <FiShield style={{ color: '#10B981' }} /> Customer Care & Mission Command Hub
              </h3>
              <p className="command-hub-subtitle">
                Instant assistance, live concierge chat, route delay intelligence, and issue resolutions
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="compact-toggle-btn"
                onClick={() => setSupportCollapsed(!supportCollapsed)}
                title={supportCollapsed ? 'Expand 5 support cards' : 'Compact support view'}
              >
                {supportCollapsed ? (
                  <>
                    <FiChevronDown size={13} /> Expand Hub
                  </>
                ) : (
                  <>
                    <FiChevronUp size={13} /> Compact
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm open-concierge-btn"
                onClick={() => handleOpenSupport('chat')}
              >
                <FiMessageSquare /> Live Chat
              </button>
            </div>
          </div>

          {supportCollapsed ? (
            <div className="support-collapsed-ribbon">
              <button type="button" className="support-ribbon-btn" onClick={() => handleOpenSupport('chat')}>
                <FiMessageSquare size={13} /> Live Chat
              </button>
              <button type="button" className="support-ribbon-btn" onClick={() => handleOpenSupport('delays')}>
                <FiClock size={13} /> Delays & Late Guarantee
              </button>
              <button type="button" className="support-ribbon-btn" onClick={() => handleOpenSupport('issues')}>
                <FiAlertTriangle size={13} /> Order Issues / Not Reached
              </button>
              <button type="button" className="support-ribbon-btn" onClick={() => handleOpenSupport('reviews')}>
                <FiStar size={13} /> Review Meal (+20 Pts)
              </button>
              <button type="button" className="support-ribbon-btn" onClick={() => handleOpenSupport('drawbacks')}>
                <FiHelpCircle size={13} /> Website Feedback (Promo)
              </button>
            </div>
          ) : (
            <div className="command-hub-grid">
              {/* Card 1: Live Chat */}
              <div
                className="command-card glow-card-interactive"
                onClick={() => handleOpenSupport('chat')}
              >
                <div className="command-card-icon" style={{ background: 'rgba(255, 77, 46, 0.15)', color: 'var(--primary)' }}>
                  <FiMessageSquare size={20} />
                </div>
                <div className="command-card-content">
                  <h4>Chat with Us</h4>
                  <p>24/7 AI Order Concierge & Human Agents on standby</p>
                  <span className="command-card-action">Start Conversation →</span>
                </div>
              </div>

              {/* Card 2: Delays */}
              <div
                className="command-card glow-card-interactive"
                onClick={() => handleOpenSupport('delays')}
              >
                <div className="command-card-icon" style={{ background: 'rgba(255, 138, 0, 0.15)', color: 'var(--accent)' }}>
                  <FiClock size={20} />
                </div>
                <div className="command-card-content">
                  <h4>Delivery Delays</h4>
                  <p>Track corridor slowdowns & claim ₹50 late guarantee credit</p>
                  <span className="command-card-action">Check Guarantee →</span>
                </div>
              </div>

              {/* Card 3: Issues */}
              <div
                className="command-card glow-card-interactive"
                onClick={() => handleOpenSupport('issues')}
              >
                <div className="command-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                  <FiAlertTriangle size={20} />
                </div>
                <div className="command-card-content">
                  <h4>Order Issues / Not Reached</h4>
                  <p>Missing items, food damage, or order not arrived</p>
                  <span className="command-card-action">Dispute & Resolve →</span>
                </div>
              </div>

              {/* Card 4: Reviews */}
              <div
                className="command-card glow-card-interactive"
                onClick={() => handleOpenSupport('reviews')}
              >
                <div className="command-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                  <FiStar size={20} />
                </div>
                <div className="command-card-content">
                  <h4>Review & Rating</h4>
                  <p>Rate food flavor and rider speed to earn 20 Foodie loyalty points</p>
                  <span className="command-card-action">Leave Rating →</span>
                </div>
              </div>

              {/* Card 5: Drawbacks */}
              <div
                className="command-card glow-card-interactive"
                onClick={() => handleOpenSupport('drawbacks')}
              >
                <div className="command-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
                  <FiHelpCircle size={20} />
                </div>
                <div className="command-card-content">
                  <h4>Website Drawbacks</h4>
                  <p>Report UI glitches, slow loading, or feedback & unlock discount promo</p>
                  <span className="command-card-action">Give Feedback →</span>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Customer Support & Resolution Modal */}
        <CustomerSupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          initialTab={supportInitialTab}
          order={order}
        />

        {/* Rider Contact & Drop-off Notes Modal */}
        <RiderContactModal
          isOpen={riderModalOpen}
          onClose={() => setRiderModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default OrderDetailPage;
