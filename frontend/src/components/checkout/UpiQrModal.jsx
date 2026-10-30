import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiSmartphone,
  FiRefreshCw,
  FiShield,
  FiX,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';
import '../../styles/upiPayment.css';

export const UPI_PROVIDERS = [
  {
    id: 'all',
    name: 'All UPI Apps',
    shortName: 'Any UPI',
    vpa: 'altsfoodspot@icici',
    themeColor: '#ff4d2e',
    badgeText: 'UPI',
    instruction: 'Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM, CRED)'
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    shortName: 'GPay',
    vpa: 'altsfoodspot.gpay@okaxis',
    themeColor: '#1a73e8',
    badgeText: 'GPay',
    instruction: 'Scan with Google Pay App to make payment'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    shortName: 'PhonePe',
    vpa: 'altsfoodspot.phonepe@ybl',
    themeColor: '#5f259f',
    badgeText: 'PhonePe',
    instruction: 'Scan with PhonePe App to make payment'
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    shortName: 'Paytm',
    vpa: 'altsfoodspot.paytm@paytm',
    themeColor: '#00b9f1',
    badgeText: 'Paytm',
    instruction: 'Scan with Paytm App to make payment'
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    shortName: 'BHIM',
    vpa: 'altsfoodspot.bhim@upi',
    themeColor: '#f26522',
    badgeText: 'BHIM',
    instruction: 'Scan with BHIM App to make payment'
  },
  {
    id: 'cred',
    name: 'CRED UPI',
    shortName: 'CRED',
    vpa: 'altsfoodspot.cred@axis',
    themeColor: '#0f172a',
    badgeText: 'CRED',
    instruction: 'Scan with CRED App to make payment'
  }
];

const QrIcon = ({ size = 20, className = '' }) => (
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

const UpiQrModal = ({
  isOpen,
  onClose,
  total,
  restaurantName = 'ALTS FOOD spot Delivery',
  onPaymentSuccess,
  isProcessing = false,
  initialApp = 'all'
}) => {
  const [selectedAppId, setSelectedAppId] = useState(initialApp || 'all');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [verifyingStep, setVerifyingStep] = useState('idle'); // 'idle' | 'checking' | 'verified'

  const activeProvider =
    UPI_PROVIDERS.find((p) => p.id === selectedAppId) || UPI_PROVIDERS[0];

  // Standard official UPI Deep-Link Intent URI customized per selected app
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(
    activeProvider.vpa
  )}&pn=${encodeURIComponent('ALTS FOOD spot')}&am=${Number(total).toFixed(
    2
  )}&cu=INR&tn=${encodeURIComponent(`ALTS FOOD spot - ${activeProvider.name}`)}`;

  // Generate real, scan-compliant QR Code for the selected provider
  const generateQrForProvider = async (provider) => {
    try {
      const uri = `upi://pay?pa=${encodeURIComponent(
        provider.vpa
      )}&pn=${encodeURIComponent('ALTS FOOD spot')}&am=${Number(total).toFixed(
        2
      )}&cu=INR&tn=${encodeURIComponent(`ALTS FOOD spot - ${provider.name}`)}`;

      const url = await QRCode.toDataURL(uri, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      setQrUrl(url);
    } catch (err) {
      console.error('Failed to generate UPI QR:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateQrForProvider(activeProvider);
      setTimeLeft(300);
      setVerifyingStep('idle');
    }
  }, [isOpen, total, selectedAppId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Escape key handler to move back
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && verifyingStep === 'idle' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, verifyingStep, isProcessing, onClose]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(activeProvider.vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSelectApp = (providerId) => {
    setSelectedAppId(providerId);
    const target = UPI_PROVIDERS.find((p) => p.id === providerId) || UPI_PROVIDERS[0];
    generateQrForProvider(target);
  };

  const handleConfirmPaid = async () => {
    if (verifyingStep !== 'idle' || isProcessing) return;

    // Simulated NPCI / UPI Gateway verification sequence
    setVerifyingStep('checking');
    await new Promise((res) => setTimeout(res, 1400));

    setVerifyingStep('verified');
    await new Promise((res) => setTimeout(res, 800));

    // Place the order
    if (onPaymentSuccess) {
      await onPaymentSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="upi-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (verifyingStep === 'idle' && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className="upi-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="upi-modal-header">
          <div className="upi-modal-title-group">
            <button
              type="button"
              className="upi-modal-back-btn"
              onClick={onClose}
              disabled={verifyingStep !== 'idle' || isProcessing}
              title="Back to Payment Methods"
            >
              <FiArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div
              className="upi-header-icon-wrap"
              style={{
                background: `${activeProvider.themeColor}18`,
                color: activeProvider.themeColor
              }}
            >
              <QrIcon size={22} />
            </div>
            <div>
              <h2 className="upi-modal-heading">Scan & Pay with UPI</h2>
              <p className="upi-modal-sub">
                Paying via <strong>{activeProvider.name}</strong> • Scan with phone camera or UPI app
              </p>
            </div>
          </div>
          <button
            className="upi-modal-close-btn"
            onClick={onClose}
            aria-label="Close UPI Modal"
            disabled={verifyingStep !== 'idle' || isProcessing}
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Amount & Timer Ribbon */}
        <div className="upi-amount-ribbon">
          <div className="upi-amount-info">
            <span className="upi-amount-label">Payable Amount</span>
            <span className="upi-amount-value">₹{Number(total).toFixed(2)}</span>
          </div>
          <div className={`upi-timer-badge ${timeLeft < 60 ? 'warning' : ''}`}>
            <FiRefreshCw className="upi-spin-slow" size={13} />
            <span>Valid: {formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* QR Code Presentation Box (Clean, Crisp, 100% Unobstructed QR) */}
        <div className="upi-qr-display-box">
          {/* Active Provider Tag */}
          <div
            className="upi-active-app-pill"
            style={{
              borderColor: `${activeProvider.themeColor}35`,
              color: activeProvider.themeColor,
              background: `${activeProvider.themeColor}12`
            }}
          >
            <span
              className="upi-app-dot"
              style={{ background: activeProvider.themeColor }}
            />
            <span>{activeProvider.name} QR Code</span>
          </div>

          <div className="upi-qr-viewport">
            {/* Clean QR Code Image with zero border overlays or interactions */}
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`Scan UPI QR Code for ${activeProvider.name} to pay ₹${total}`}
                className="upi-qr-img"
              />
            ) : (
              <div className="upi-qr-placeholder">Generating Secure QR...</div>
            )}
          </div>

          <p className="upi-scan-instructions">{activeProvider.instruction}</p>

          {/* Interactive UPI App Selection Buttons */}
          <div className="upi-app-selector-title">
            <span>Tap an app to change QR Code:</span>
          </div>
          <div className="upi-supported-apps">
            {UPI_PROVIDERS.map((provider) => {
              const isSelected = activeProvider.id === provider.id;
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
                  onClick={() => handleSelectApp(provider.id)}
                  title={`Switch QR Code to ${provider.name}`}
                >
                  {provider.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* VPA Details & Deep Link for Mobile */}
        <div className="upi-details-card">
          <div className="upi-vpa-row">
            <div>
              <span className="upi-vpa-label">{activeProvider.name} UPI ID</span>
              <div className="upi-vpa-text">{activeProvider.vpa}</div>
            </div>
            <button
              type="button"
              className="upi-copy-btn"
              onClick={handleCopyVpa}
              title="Copy UPI ID"
            >
              {copied ? (
                <>
                  <FiCheck size={14} color="var(--success, #10b981)" />
                  <span style={{ color: 'var(--success, #10b981)' }}>Copied</span>
                </>
              ) : (
                <>
                  <FiCopy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Intent Direct Link */}
          <a
            href={upiIntentUri}
            className="upi-intent-link"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              borderColor: `${activeProvider.themeColor}35`,
              color: activeProvider.themeColor,
              background: `${activeProvider.themeColor}10`
            }}
          >
            <FiSmartphone size={16} />
            <span>Pay directly via {activeProvider.name} App</span>
            <FiArrowRight size={14} />
          </a>
        </div>

        {/* Verification Status Feedback (when user clicks paid) */}
        {verifyingStep !== 'idle' && (
          <div className={`upi-verification-status ${verifyingStep}`}>
            {verifyingStep === 'checking' ? (
              <>
                <div className="upi-mini-spinner" />
                <div>
                  <strong>Checking with {activeProvider.name} / UPI switch...</strong>
                  <p>Confirming transaction of ₹{total} from your bank app</p>
                </div>
              </>
            ) : (
              <>
                <FiCheckCircle size={24} color="#10b981" />
                <div>
                  <strong style={{ color: '#10b981' }}>Payment Verified!</strong>
                  <p>Creating your order with {restaurantName}...</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="upi-modal-actions">
          <button
            type="button"
            className="upi-confirm-btn"
            onClick={handleConfirmPaid}
            disabled={verifyingStep !== 'idle' || isProcessing || timeLeft === 0}
          >
            {verifyingStep === 'idle' ? (
              <>
                <FiCheckCircle size={18} />
                <span>I Have Completed Payment (₹{total})</span>
              </>
            ) : (
              <span>Processing Order...</span>
            )}
          </button>

          <button
            type="button"
            className="upi-cancel-btn"
            onClick={onClose}
            disabled={verifyingStep !== 'idle' || isProcessing}
          >
            <FiArrowLeft size={16} />
            <span>Back to Payment Methods</span>
          </button>
        </div>

        <div className="upi-modal-footer">
          <FiShield size={13} />
          <span>NPCI Unified Payments Interface • 100% Secure Simulated Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default UpiQrModal;
