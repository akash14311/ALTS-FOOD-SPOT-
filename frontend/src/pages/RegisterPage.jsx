import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiKey,
  FiRefreshCw,
  FiCheckCircle,
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import '../styles/auth.css';

const RegisterPage = () => {
  const { register, sendOtp, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'mobile' | 'email' | 'classic'
  const [signupMode, setSignupMode] = useState('mobile');

  // Individual Form Fields
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Active OTP State
  const [otpStep, setOtpStep] = useState('INPUT'); // 'INPUT' | 'VERIFY'
  const [activeIdentifier, setActiveIdentifier] = useState('');
  const [activeChannel, setActiveChannel] = useState('phone'); // 'phone' | 'email'
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const inputRefs = useRef([]);

  // Classic Form State
  const [classicData, setClassicData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const destination = location.state?.from || '/';

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first OTP box
  useEffect(() => {
    if (otpStep === 'VERIFY') {
      setTimeout(() => inputRefs.current[0]?.focus(), 120);
    }
  }, [otpStep]);

  // --- SEND OTP HANDLER (INDIVIDUAL CHANNEL) ---
  const handleSendOtp = async (channelToUse) => {
    const channel = channelToUse || activeChannel;
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    let targetId = '';
    let secondary = '';

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
      secondary = emailAddress.trim();
    } else {
      const cleanEmail = emailAddress.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid email address (e.g. you@gmail.com).');
        return;
      }
      targetId = cleanEmail;
      secondary = mobileNumber.trim();
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

  const handleConfirmOtp = async (codeOverride) => {
    const code = codeOverride || otpBoxes.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }

    setError('');
    try {
      setLoading(true);
      const secondary = activeChannel === 'phone' ? emailAddress.trim() : mobileNumber.trim();
      await verifyOtp(activeIdentifier, code, name.trim(), activeChannel, secondary);
      setSuccessMsg('Account verified & created successfully! Welcome to ALTS FOOD spot.');
      setTimeout(() => navigate(destination, { replace: true }), 500);
    } catch (err) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  // --- CLASSIC FORM HANDLERS ---
  const handleClassicChange = (e) => {
    setClassicData({ ...classicData, [e.target.name]: e.target.value });
  };

  const handleClassicSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name: cName, email: cEmail, mobile: cMobile, password: cPassword, confirmPassword } = classicData;

    if (!cName || !cEmail || !cMobile || !cPassword) {
      setError('Please fill in all required fields');
      return;
    }

    const mobileClean = cMobile.trim();
    if (!/^\d{10}$/.test(mobileClean)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (cPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (cPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: cName,
        email: cEmail,
        mobile: mobileClean,
        password: cPassword,
      });
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '490px' }}>
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            <IoFastFoodOutline style={{ color: 'var(--primary)', fontSize: '1.6rem' }} />
            <span className="brand-badge-alts">ALTS</span>
            <span className="brand-text-food">FOOD</span>
            <span className="brand-text-spot">SPOT</span>
          </Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Verify individually via Mobile Number SMS or Email Inbox OTP to start ordering
          </p>
        </div>

        {/* 3 Tabs: Mobile OTP Sign Up vs Email OTP Sign Up vs Classic */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab-btn ${signupMode === 'mobile' ? 'active' : ''}`}
            onClick={() => {
              setSignupMode('mobile');
              setOtpStep('INPUT');
              setError('');
              setSuccessMsg('');
            }}
            id="tab-mobile-signup"
          >
            <FiPhone />
            <span>Mobile Sign Up</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${signupMode === 'email' ? 'active' : ''}`}
            onClick={() => {
              setSignupMode('email');
              setOtpStep('INPUT');
              setError('');
              setSuccessMsg('');
            }}
            id="tab-email-signup"
          >
            <FiMail />
            <span>Email Sign Up</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${signupMode === 'classic' ? 'active' : ''}`}
            onClick={() => {
              setSignupMode('classic');
              setError('');
              setSuccessMsg('');
            }}
            id="tab-classic-signup"
          >
            <FiKey />
            <span>Classic Form</span>
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
            OPTION 1: INDIVIDUAL MOBILE NUMBER OTP REGISTRATION
            ========================================================= */}
        {signupMode === 'mobile' && (
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
                  <label className="form-label" htmlFor="mobile-signup-name">
                    Full Name
                  </label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon text-primary" />
                    <input
                      type="text"
                      id="mobile-signup-name"
                      className="form-input"
                      placeholder="Ananya Roy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mobile-signup-phone">
                    Mobile Number (SMS OTP Verification)
                  </label>
                  <div className="phone-input-combo">
                    <span className="phone-country-code">🇮🇳 +91</span>
                    <input
                      type="tel"
                      id="mobile-signup-phone"
                      placeholder="9876543210 (10 digits)"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      required
                    />
                  </div>
                  <span className="otp-badge-helper">
                    📲 A real 6-digit SMS code will be dispatched to your phone
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mobile-signup-email">
                    Email Address (Optional)
                  </label>
                  <div className="form-input-wrapper">
                    <FiMail className="form-input-icon" />
                    <input
                      type="email"
                      id="mobile-signup-email"
                      className="form-input"
                      placeholder="ananya@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || !name.trim() || mobileNumber.length < 10}
                  id="signup-send-mobile-otp-btn"
                >
                  {loading ? (
                    'Sending Mobile SMS OTP...'
                  ) : (
                    <>
                      Verify Mobile & Create Account <FiArrowRight />
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
            OPTION 2: INDIVIDUAL EMAIL INBOX OTP REGISTRATION
            ========================================================= */}
        {signupMode === 'email' && (
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
                  <label className="form-label" htmlFor="email-signup-name">
                    Full Name
                  </label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon text-primary" />
                    <input
                      type="text"
                      id="email-signup-name"
                      className="form-input"
                      placeholder="Ananya Roy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email-signup-email">
                    Email Address (Inbox OTP Verification)
                  </label>
                  <div className="form-input-wrapper">
                    <FiMail className="form-input-icon text-primary" />
                    <input
                      type="email"
                      id="email-signup-email"
                      className="form-input"
                      placeholder="ananya@gmail.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <span className="otp-badge-helper">
                    📧 A secure 6-digit verification code will be sent to your email inbox
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email-signup-mobile">
                    Mobile Number (Optional)
                  </label>
                  <div className="phone-input-combo">
                    <span className="phone-country-code">🇮🇳 +91</span>
                    <input
                      type="tel"
                      id="email-signup-mobile"
                      placeholder="9876543210 (10 digits)"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || !name.trim() || !emailAddress.trim()}
                  id="signup-send-email-otp-btn"
                >
                  {loading ? (
                    'Dispatching Email OTP...'
                  ) : (
                    <>
                      Verify Email & Create Account <FiArrowRight />
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
            OPTION 3: CLASSIC REGISTRATION FORM
            ========================================================= */}
        {signupMode === 'classic' && (
          <form className="auth-form" onSubmit={handleClassicSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <div className="form-input-wrapper">
                <FiUser className="form-input-icon" />
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  className="form-input"
                  placeholder="Rahul Sharma"
                  value={classicData.name}
                  onChange={handleClassicChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <FiMail className="form-input-icon" />
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={classicData.email}
                  onChange={handleClassicChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-mobile">
                Mobile Number
              </label>
              <div className="phone-input-combo">
                <span className="phone-country-code">🇮🇳 +91</span>
                <input
                  type="tel"
                  id="register-mobile"
                  name="mobile"
                  placeholder="9876543210 (10 digits)"
                  maxLength={10}
                  value={classicData.mobile}
                  onChange={handleClassicChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div className="form-input-wrapper">
                <FiLock className="form-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  name="password"
                  className="form-input has-toggle"
                  placeholder="Min 6 characters"
                  value={classicData.password}
                  onChange={handleClassicChange}
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

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <div className="form-input-wrapper">
                <FiLock className="form-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="register-confirm-password"
                  name="confirmPassword"
                  className="form-input has-toggle"
                  placeholder="Repeat password"
                  value={classicData.confirmPassword}
                  onChange={handleClassicChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account <FiArrowRight />
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
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
                id={`signup-otp-box-${idx}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => handleConfirmOtp()}
          disabled={loading || otpBoxes.join('').length !== 6}
          id="signup-confirm-otp-btn"
        >
          {loading ? 'Creating Account...' : 'Confirm & Complete Registration'}
        </button>

        {/* Resend Cooldown & Switch Target */}
        <div className="otp-action-row">
          <button
            type="button"
            onClick={() => handleSendOtp(activeChannel)}
            disabled={cooldown > 0 || loading}
            className="otp-resend-btn"
            id="signup-resend-otp-btn"
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

export default RegisterPage;
