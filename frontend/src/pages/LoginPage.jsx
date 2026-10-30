import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiMail,
  FiPhone,
  FiLock,
  FiArrowRight,
  FiInfo,
  FiEye,
  FiEyeOff,
  FiKey,
  FiRefreshCw,
  FiCheckCircle,
  FiExternalLink,
  FiMessageSquare,
  FiCopy,
  FiCheck,
  FiSettings,
  FiSend,
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import '../styles/auth.css';

const LoginPage = () => {
  const { login, sendOtp, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication Mode: 'mobile' | 'email' | 'password'
  const [authMode, setAuthMode] = useState('mobile');

  // Individual Inputs
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Active OTP Session State
  const [otpStep, setOtpStep] = useState('INPUT'); // 'INPUT' | 'VERIFY'
  const [activeIdentifier, setActiveIdentifier] = useState('');
  const [activeChannel, setActiveChannel] = useState('phone'); // 'phone' | 'email'
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const inputRefs = useRef([]);

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const destination = location.state?.from || '/';

  // 60-Second Cooldown Countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP box upon reaching verification step
  useEffect(() => {
    if (otpStep === 'VERIFY') {
      setTimeout(() => inputRefs.current[0]?.focus(), 120);
    }
  }, [otpStep]);

  // --- SEND OTP HANDLER (INDIVIDUAL MOBILE / EMAIL) ---
  const handleSendOtp = async (channelToUse) => {
    const channel = channelToUse || activeChannel;
    setError('');
    setSuccessMsg('');

    let targetId = '';
    if (channel === 'phone') {
      const cleanDigits = mobileNumber.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      targetId = cleanDigits.startsWith('91') && cleanDigits.length === 12
        ? `+${cleanDigits}`
        : cleanDigits.length === 10
        ? `+91${cleanDigits}`
        : `+${cleanDigits}`;
    } else {
      const cleanEmail = emailAddress.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid email address (e.g. you@gmail.com).');
        return;
      }
      targetId = cleanEmail;
    }

    try {
      setLoading(true);
      const res = await sendOtp(targetId, channel);
      setActiveIdentifier(res?.identifier || targetId);
      setActiveChannel(channel);
      setOtpStep('VERIFY');
      setCooldown(res?.cooldownSeconds || 60);
      setDeliveryInfo(res?.delivery || null);
      setSuccessMsg(
        channel === 'phone'
          ? `SMS verification code dispatched to mobile: ${res?.identifier || targetId}`
          : `Email verification code sent to your inbox: ${res?.identifier || targetId}`
      );
      setOtpBoxes(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  // --- OTP BOX CHANGE HANDLERS ---
  const handleBoxChange = (index, val) => {
    const numOnly = val.replace(/\D/g, '');
    if (!numOnly) {
      const copy = [...otpBoxes];
      copy[index] = '';
      setOtpBoxes(copy);
      return;
    }

    const lastChar = numOnly.slice(-1);
    const copy = [...otpBoxes];
    copy[index] = lastChar;
    setOtpBoxes(copy);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      const fullCode = copy.join('');
      if (fullCode.length === 6) {
        handleConfirmOtp(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpBoxes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const copy = [...otpBoxes];
    for (let i = 0; i < pasted.length; i++) {
      copy[i] = pasted[i];
    }
    setOtpBoxes(copy);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      handleConfirmOtp(pasted);
    }
  };

  // --- CONFIRM OTP VERIFICATION ---
  const handleConfirmOtp = async (codeOverride) => {
    const code = codeOverride || otpBoxes.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }

    setError('');
    try {
      setLoading(true);
      await verifyOtp(activeIdentifier, code, null, activeChannel);
      setSuccessMsg('Authentication confirmed! Redirecting to ALTS FOOD spot...');
      setTimeout(() => navigate(destination, { replace: true }), 500);
    } catch (err) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  // --- PASSWORD LOGIN HANDLER ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing & viva presentation
  const handleQuickFill = (targetIdentifier, targetPassword, type) => {
    setError('');
    setSuccessMsg('');
    setOtpStep('INPUT');

    if (targetPassword) {
      setAuthMode('password');
      setEmail(targetIdentifier);
      setPassword(targetPassword);
    } else if (type === 'phone' || targetIdentifier.startsWith('+') || /^\d+$/.test(targetIdentifier)) {
      setAuthMode('mobile');
      setMobileNumber(targetIdentifier.replace(/\D/g, '').slice(-10));
    } else {
      setAuthMode('email');
      setEmailAddress(targetIdentifier);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '490px' }}>
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            <IoFastFoodOutline /> ALTS FOOD<span> spot</span>
          </Link>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">
            Verify via individual Mobile SMS or Email Inbox OTP to access your orders
          </p>
        </div>

        {/* 1-Click Demo Fill Bar */}
        <div className="quick-credentials-box">
          <div className="quick-credentials-title">
            <FiInfo /> 1-Click Demo Logins (Viva & Testing):
          </div>
          <div className="quick-buttons">
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill('9888877771', null, 'phone')}
              id="demo-mobile-btn"
            >
              📱 Mobile (Rahul: 9888877771)
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill('rahul@altsfoodspot.com', null, 'email')}
              id="demo-email-btn"
            >
              📧 Email (rahul@altsfoodspot.com)
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => handleQuickFill('admin@gmail.com', 'Admin@123')}
              id="demo-admin-fill-btn"
            >
              🛡️ Admin Password
            </button>
          </div>
        </div>

        {/* 3 Dedicated Top Tabs: Mobile OTP vs Email OTP vs Password */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'mobile' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('mobile');
              setOtpStep('INPUT');
              setError('');
              setSuccessMsg('');
            }}
            id="tab-mobile-otp"
          >
            <FiPhone />
            <span>Mobile SMS</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'email' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('email');
              setOtpStep('INPUT');
              setError('');
              setSuccessMsg('');
            }}
            id="tab-email-otp"
          >
            <FiMail />
            <span>Email Inbox</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'password' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('password');
              setError('');
              setSuccessMsg('');
            }}
            id="tab-password-login"
          >
            <FiKey />
            <span>Password</span>
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: '600',
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <FiCheckCircle />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================
            OPTION 1: INDIVIDUAL MOBILE NUMBER OTP VERIFICATION
            ========================================================= */}
        {authMode === 'mobile' && (
          <div>
            {otpStep === 'INPUT' ? (
              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp('phone');
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="login-mobile-input">
                    Enter Your Mobile Number
                  </label>
                  <div className="phone-input-combo">
                    <span className="phone-country-code">🇮🇳 +91</span>
                    <input
                      type="tel"
                      id="login-mobile-input"
                      placeholder="9876543210 (10 digits)"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      required
                    />
                  </div>
                  <span className="otp-badge-helper">
                    📲 A 6-digit SMS OTP will be dispatched directly to your mobile phone
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || mobileNumber.length < 10}
                  id="send-mobile-otp-btn"
                >
                  {loading ? (
                    'Sending SMS OTP...'
                  ) : (
                    <>
                      Send SMS OTP to Mobile <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verification */
              renderVerificationStep()
            )}
          </div>
        )}

        {/* =========================================================
            OPTION 2: INDIVIDUAL EMAIL INBOX OTP VERIFICATION
            ========================================================= */}
        {authMode === 'email' && (
          <div>
            {otpStep === 'INPUT' ? (
              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp('email');
                }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email-input">
                    Enter Your Email Address
                  </label>
                  <div className="form-input-wrapper">
                    <FiMail className="form-input-icon text-primary" />
                    <input
                      type="email"
                      id="login-email-input"
                      className="form-input"
                      placeholder="you@gmail.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <span className="otp-badge-helper">
                    📧 A secure 6-digit OTP will be transmitted to your email inbox
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || !emailAddress.trim()}
                  id="send-email-otp-btn"
                >
                  {loading ? (
                    'Dispatching Email OTP...'
                  ) : (
                    <>
                      Send OTP to Email Inbox <FiArrowRight />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verification */
              renderVerificationStep()
            )}
          </div>
        )}

        {/* =========================================================
            OPTION 3: CLASSIC PASSWORD AUTHENTICATION
            ========================================================= */}
        {authMode === 'password' && (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <FiMail className="form-input-icon" />
                <input
                  type="email"
                  id="login-email"
                  className="form-input"
                  placeholder="you@altsfoodspot.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="form-input-wrapper">
                <FiLock className="form-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-input has-toggle"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create an account here</Link>
        </div>
      </div>
    </div>
  );

  // --- REUSABLE VERIFICATION STEP ---
  function renderVerificationStep() {
    return (
      <div className="auth-form">

        <div className="form-group" style={{ textAlign: 'center' }}>
          <label className="form-label" style={{ marginBottom: '0.2rem' }}>
            Enter 6-Digit Verification Code
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
            {activeChannel === 'phone' ? 'Sent via SMS to ' : 'Sent via Email to '}
            <strong style={{ color: 'var(--text-main)' }}>{activeIdentifier}</strong>
          </p>

          <div className="otp-boxes-container">
            {otpBoxes.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleBoxChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`otp-box-input ${digit ? 'filled' : ''}`}
                id={`otp-box-${idx}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => handleConfirmOtp()}
          disabled={loading || otpBoxes.join('').length !== 6}
          id="confirm-otp-btn"
        >
          {loading ? 'Verifying Code...' : 'Confirm & Sign In'}
        </button>

        {/* Resend Cooldown & Switch Target */}
        <div className="otp-action-row">
          <button
            type="button"
            onClick={() => handleSendOtp(activeChannel)}
            disabled={cooldown > 0 || loading}
            className="otp-resend-btn"
            id="resend-otp-btn"
          >
            <FiRefreshCw className={loading ? 'spin-icon' : ''} />
            <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOtpStep('INPUT');
              setDeliveryInfo(null);
              setError('');
              setSuccessMsg('');
            }}
            className="otp-change-btn"
          >
            Change {activeChannel === 'phone' ? 'mobile number' : 'email'}
          </button>
        </div>
      </div>
    );
  }
};

export default LoginPage;
