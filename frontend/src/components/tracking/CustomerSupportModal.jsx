import React, { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiMessageSquare,
  FiClock,
  FiAlertTriangle,
  FiStar,
  FiHelpCircle,
  FiSend,
  FiCheckCircle,
  FiShield,
  FiGift,
  FiPhoneCall,
  FiRefreshCw,
  FiThumbsUp,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const CustomerSupportModal = ({ isOpen, onClose, initialTab = 'chat', order }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Delays State
  const [escalated, setEscalated] = useState(false);
  const [compensationClaimed, setCompensationClaimed] = useState(false);

  // Issues State
  const [issueType, setIssueType] = useState('not_reached');
  const [issueDescription, setIssueDescription] = useState('');
  const [resolutionChoice, setResolutionChoice] = useState('refund');
  const [issueSubmitted, setIssueSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Reviews State
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Hot & Fresh', 'Spill-Proof']);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Drawbacks / Feedback State
  const [drawbackCategory, setDrawbackCategory] = useState('performance');
  const [severity, setSeverity] = useState('medium');
  const [drawbackText, setDrawbackText] = useState('');
  const [drawbackSubmitted, setDrawbackSubmitted] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'agent',
          text: `Hi there! I'm Alex, your dedicated FoodSpot Priority Concierge. I am actively monitoring Order #${order?._id ? order._id.slice(-6).toUpperCase() : 'ORDER'} from ${order?.restaurant?.name || 'Restaurant'}. How can I assist you right now?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, order]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '🚀 Where is my order now?', query: 'Where is my delivery right now?' },
    { label: '⏳ Check delay status', query: 'Why is my delivery taking time?' },
    { label: '⚠️ Order not reached', query: 'My order is marked delivered but not reached.' },
    { label: '📞 Contact rider directly', query: 'How do I call my delivery rider?' },
    { label: '🎁 Claim delay compensation', query: 'Can I get compensation for delay?' },
  ];

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputMsg.trim();
    if (!query) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setIsTyping(true);

    // Simulate smart AI support response with order context
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('where') || lower.includes('status') || lower.includes('location')) {
        reply = `Your order is currently in the "${order?.status || 'Active'}" stage. Our courier Rahul is tracking via Galileo GPS. Estimated arrival window is 20-25 mins at ${order?.address?.street || 'your delivery address'}.`;
      } else if (lower.includes('delay') || lower.includes('time') || lower.includes('late')) {
        reply = `We maintain a strict On-Time Guarantee! We've already alerted the kitchen dispatch. If delivery exceeds estimated time, you can instantly claim a ₹50 voucher in the "Delivery Delays" tab.`;
      } else if (lower.includes('not reached') || lower.includes('missing') || lower.includes('not arrived')) {
        reply = `I apologize for any distress! Please tap the "Delivery Issues" tab above to trigger an immediate supervisor review or choose an instant 100% refund / priority redelivery.`;
      } else if (lower.includes('call') || lower.includes('rider') || lower.includes('contact')) {
        reply = `Courier Partner: Rahul Verma (Ather 450X EV, 4.9 ★). You can reach him directly at +91 98765-43210 or through the Call Rider action button.`;
      } else if (lower.includes('compensation') || lower.includes('coupon') || lower.includes('refund')) {
        reply = `As our valued gourmet member, use exclusive coupon code "SORRY50" on your next order for ₹50 OFF, or claim instant wallet credits under the Delivery Delays tab!`;
      } else {
        reply = `Thank you for sharing that. I have linked this note to Order #${order?._id.slice(-6).toUpperCase()}. Our senior support team is on standby 24/7 if you need further escalation.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleEscalateDelay = () => {
    setEscalated(true);
    showToast('Priority escalation dispatched to dispatch team & kitchen!', 'success');
  };

  const handleClaimCompensation = () => {
    setCompensationClaimed(true);
    showToast('₹50 FoodSpot Late Delivery Credit applied to your account!', 'success');
  };

  const handleSubmitIssue = (e) => {
    e.preventDefault();
    const id = `FS-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(id);
    setIssueSubmitted(true);
    showToast(`Support Ticket #${id} created! Priority resolution in progress.`, 'success');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviewSubmitted(true);
    showToast('Thank you! Your ratings & review have been published.', 'success');
  };

  const handleSubmitDrawback = (e) => {
    e.preventDefault();
    setDrawbackSubmitted(true);
    showToast('Thank you for helping us improve FoodSpot! Code "BETAHERO" unlocked.', 'success');
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="support-modal-backdrop" onClick={onClose}>
      <div
        className="support-modal-card futuristic-glow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="support-modal-header">
          <div className="support-header-title-box">
            <div className="support-shield-icon">
              <FiShield size={20} />
            </div>
            <div>
              <h2 className="support-title">Priority Customer Care & Resolution Hub</h2>
              <p className="support-subtitle">
                Order #{order?._id ? order._id.slice(-6).toUpperCase() : ''} • Live Assistance 24/7
              </p>
            </div>
          </div>
          <button className="support-close-btn" onClick={onClose} aria-label="Close Support">
            <FiX size={20} />
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="support-tabs-row">
          <button
            className={`support-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <FiMessageSquare size={16} /> Chat With Us
          </button>
          <button
            className={`support-tab-btn ${activeTab === 'delays' ? 'active' : ''}`}
            onClick={() => setActiveTab('delays')}
          >
            <FiClock size={16} /> Delivery Delays
          </button>
          <button
            className={`support-tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <FiAlertTriangle size={16} /> Delivery Issues / Not Reached
          </button>
          <button
            className={`support-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FiStar size={16} /> Review & Rating
          </button>
          <button
            className={`support-tab-btn ${activeTab === 'drawbacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('drawbacks')}
          >
            <FiHelpCircle size={16} /> Website Drawbacks
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="support-modal-body">
          {/* TAB 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="support-chat-pane">
              <div className="support-chat-messages">
                {messages.map((m) => (
                  <div key={m.id} className={`chat-bubble-row ${m.sender === 'user' ? 'user' : 'agent'}`}>
                    <div className="chat-bubble">
                      <div className="chat-text">{m.text}</div>
                      <div className="chat-timestamp">{m.time}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-bubble-row agent">
                    <div className="chat-bubble typing-bubble">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Chips */}
              <div className="chat-quick-chips">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => handleSendMessage(p.query)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <form
                className="chat-input-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message to your order concierge..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="chat-text-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!inputMsg.trim()}>
                  <FiSend size={16} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: DELIVERY DELAYS */}
          {activeTab === 'delays' && (
            <div className="support-content-pane">
              <div className="support-banner delay-banner">
                <FiClock size={28} className="banner-icon" />
                <div>
                  <h3 className="banner-heading">Real-Time Route Delay Intelligence</h3>
                  <p className="banner-desc">
                    We track monsoon weather, Indiranagar corridor traffic, and kitchen surge in real time.
                  </p>
                </div>
              </div>

              <div className="delay-telemetry-grid">
                <div className="delay-metric-box">
                  <div className="metric-tag">KITCHEN PREP TIME</div>
                  <div className="metric-val">12 Mins (Complete)</div>
                  <div className="metric-status status-good">✓ On Schedule</div>
                </div>
                <div className="delay-metric-box">
                  <div className="metric-tag">ROUTE TRAFFIC INDEX</div>
                  <div className="metric-val">+4 Mins Peak Monsoon</div>
                  <div className="metric-status status-warn">⚠ Minor Slowdown</div>
                </div>
                <div className="delay-metric-box">
                  <div className="metric-tag">ESTIMATED ARRIVAL</div>
                  <div className="metric-val">20-25 Mins</div>
                  <div className="metric-status status-good">🛵 On the way</div>
                </div>
              </div>

              <div className="delay-action-card">
                <div className="action-card-header">
                  <FiShield size={20} style={{ color: '#10B981' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>FoodSpot On-Time Guarantee</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      If your delivery exceeds 35 minutes from ordering, claim an instant ₹50 FoodSpot wallet credit.
                    </p>
                  </div>
                </div>
                <div className="action-buttons-row">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleClaimCompensation}
                    disabled={compensationClaimed}
                  >
                    <FiGift /> {compensationClaimed ? '₹50 Credit Claimed ✓' : 'Claim ₹50 Late Credit'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleEscalateDelay}
                    disabled={escalated}
                  >
                    <FiRefreshCw className={escalated ? '' : 'spin-hover'} />
                    {escalated ? 'Dispatch Prioritized ✓' : 'Alert Courier & Expedite'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY ISSUES / ORDER NOT REACHED */}
          {activeTab === 'issues' && (
            <div className="support-content-pane">
              {issueSubmitted ? (
                <div className="support-success-view">
                  <div className="success-icon-badge">
                    <FiCheckCircle size={44} style={{ color: '#10B981' }} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Issue Resolution Dispatched!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                    Reference Ticket <strong>#{ticketId}</strong> has been assigned to Senior Dispatch Supervisor Vikram S.
                    {resolutionChoice === 'refund' && ' Your full refund will reflect in your simulated source immediately.'}
                    {resolutionChoice === 'redelivery' && ' The restaurant has initiated a fresh priority cook order.'}
                    {resolutionChoice === 'credits' && ' 100% of order value + 10% bonus has been credited to your wallet.'}
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setIssueSubmitted(false);
                      onClose();
                    }}
                  >
                    Return to Order Tracker
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitIssue}>
                  <div className="support-banner issue-banner">
                    <FiAlertTriangle size={28} className="banner-icon" />
                    <div>
                      <h3 className="banner-heading">Report Delivery Issue or Missing Order</h3>
                      <p className="banner-desc">
                        Our priority dispute engine immediately escalates and resolves delivery discrepancies.
                      </p>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">What seems to be the problem?</label>
                    <select
                      className="form-select-custom"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <option value="not_reached">Order marked delivered, but I have not received it</option>
                      <option value="spilled">Food arrived spilled, leaking, or cold</option>
                      <option value="missing_items">Items missing from my ordered bag</option>
                      <option value="wrong_order">Received completely different dishes</option>
                      <option value="rider_behavior">Rider was impolite or demanded extra cash</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">How would you like us to resolve this?</label>
                    <div className="resolution-pills-row">
                      <label className={`resolution-radio-chip ${resolutionChoice === 'refund' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="resolution"
                          value="refund"
                          checked={resolutionChoice === 'refund'}
                          onChange={() => setResolutionChoice('refund')}
                        />
                        <span>100% Full Refund</span>
                      </label>
                      <label className={`resolution-radio-chip ${resolutionChoice === 'redelivery' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="resolution"
                          value="redelivery"
                          checked={resolutionChoice === 'redelivery'}
                          onChange={() => setResolutionChoice('redelivery')}
                        />
                        <span>Instant Redelivery</span>
                      </label>
                      <label className={`resolution-radio-chip ${resolutionChoice === 'credits' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="resolution"
                          value="credits"
                          checked={resolutionChoice === 'credits'}
                          onChange={() => setResolutionChoice('credits')}
                        />
                        <span>Wallet Credit + 10% Bonus</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Additional Details / Notes (Optional)</label>
                    <textarea
                      className="form-textarea-custom"
                      rows={3}
                      placeholder="e.g. checked with building security, doorbell was not rung..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Submit Priority Dispute & Resolve
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="support-content-pane">
              {reviewSubmitted ? (
                <div className="support-success-view">
                  <div className="success-icon-badge" style={{ background: 'rgba(255, 138, 0, 0.15)' }}>
                    <FiStar size={44} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Review Published!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    Your feedback rewards Chef Farhan and Courier Rahul. 20 FoodSpot Gourmet Loyalty Points added to your account!
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={onClose}>
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Rate Your Meal Experience</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      How was the food from {order?.restaurant?.name || 'Restaurant'}?
                    </p>
                  </div>

                  {/* Food Rating Stars */}
                  <div className="rating-selector-box">
                    <span className="rating-label-text">Food Quality & Taste</span>
                    <div className="star-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= foodRating ? 'filled' : ''}`}
                          onClick={() => setFoodRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Rating Stars */}
                  <div className="rating-selector-box">
                    <span className="rating-label-text">Delivery Speed & Courtesy</span>
                    <div className="star-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= deliveryRating ? 'filled' : ''}`}
                          onClick={() => setDeliveryRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compliments Chips */}
                  <div className="form-group-custom" style={{ marginTop: '1rem' }}>
                    <label className="form-label-custom">What stood out?</label>
                    <div className="review-tag-chips">
                      {[
                        'Hot & Fresh',
                        'Spill-Proof',
                        'Lightning Speed',
                        'Polite Rider',
                        'Aromatic Flavors',
                        'Eco Packaging',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`tag-chip-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {selectedTags.includes(tag) ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Write your culinary feedback</label>
                    <textarea
                      className="form-textarea-custom"
                      rows={3}
                      placeholder="Describe what you loved or how we can make your next meal better..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Publish Review & Earn Points
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: WEBSITE DRAWBACKS & BUG REPORT */}
          {activeTab === 'drawbacks' && (
            <div className="support-content-pane">
              {drawbackSubmitted ? (
                <div className="support-success-view">
                  <div className="success-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                    <FiThumbsUp size={44} style={{ color: '#6366F1' }} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Thank You for Engineering Feedback!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                    Your feedback was directly logged to our GitHub development queue. Use code <strong>BETAHERO</strong> for 15% OFF your next order!
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={onClose}>
                    Return to Tracker
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitDrawback}>
                  <div className="support-banner feedback-banner">
                    <FiHelpCircle size={28} className="banner-icon" />
                    <div>
                      <h3 className="banner-heading">Report Website Drawbacks & UX Bugs</h3>
                      <p className="banner-desc">
                        Notice any slow loading, design flaws, or checkout hitches? Tell our senior engineering team directly.
                      </p>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Issue Category</label>
                    <select
                      className="form-select-custom"
                      value={drawbackCategory}
                      onChange={(e) => setDrawbackCategory(e.target.value)}
                    >
                      <option value="performance">Slow page load or tracking lag</option>
                      <option value="checkout">Checkout / Payment modal confusion</option>
                      <option value="ui_glitch">Visual or styling glitch on my device</option>
                      <option value="tracking">Order tracking timeline synchronization</option>
                      <option value="feature_request">Feature request or design suggestion</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Severity Impact</label>
                    <div className="resolution-pills-row">
                      {['low', 'medium', 'high', 'critical'].map((sev) => (
                        <label
                          key={sev}
                          className={`resolution-radio-chip ${severity === sev ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="severity"
                            value={sev}
                            checked={severity === sev}
                            onChange={() => setSeverity(sev)}
                          />
                          <span style={{ textTransform: 'capitalize' }}>{sev}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Describe what happened & how to reproduce</label>
                    <textarea
                      className="form-textarea-custom"
                      rows={3}
                      required
                      placeholder="e.g. when I clicked the refresh icon on mobile, the layout shifted..."
                      value={drawbackText}
                      onChange={(e) => setDrawbackText(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Submit Feedback to Developers
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportModal;
