import React, { useState } from 'react';
import {
  FiX,
  FiPhone,
  FiMessageSquare,
  FiShield,
  FiCheck,
  FiPhoneCall,
  FiNavigation,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

const RiderContactModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [callActive, setCallActive] = useState(false);
  const [instructionSent, setInstructionSent] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const quickInstructions = [
    'Leave at apartment doorstep',
    'Do not ring bell (Baby sleeping)',
    'Call upon reaching security gate',
    'Hand over to security guard',
  ];

  const handleStartCall = () => {
    setCallActive(true);
    showToast('Connecting simulated encrypted voice line to Courier Partner...', 'info');
    setTimeout(() => {
      showToast('Call connected: Rahul Verma (Ather 450X)', 'success');
    }, 2000);
  };

  const handleSendInstruction = (text) => {
    setInstructionSent(true);
    showToast(`Instruction sent to Courier Partner: "${text}"`, 'success');
    setTimeout(() => {
      setInstructionSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="support-modal-backdrop" onClick={onClose}>
      <div
        className="support-modal-card futuristic-glow-card"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="support-modal-header">
          <div className="support-header-title-box">
            <div className="support-shield-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <FiPhoneCall size={20} />
            </div>
            <div>
              <h2 className="support-title">Contact Delivery Partner</h2>
              <p className="support-subtitle">Encrypted Number Masking Active</p>
            </div>
          </div>
          <button className="support-close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="support-modal-body" style={{ padding: '1.75rem' }}>
          {/* Rider Identity Card */}
          <div className="rider-modal-profile">
            <div className="rider-avatar-large">
              <span>👨‍✈️</span>
              <span className="rider-status-dot-online" />
            </div>
            <div className="rider-info-block">
              <h3 className="rider-name">Rahul Verma</h3>
              <div className="rider-tags">
                <span className="rider-pill">4.9 ★ (1,420+ Orders)</span>
                <span className="rider-pill">Ather 450X EV</span>
              </div>
              <div className="rider-safe-badge">
                <FiShield size={12} /> Sanitized Bag • Fully Vaccinated
              </div>
            </div>
          </div>

          {/* Call Screen Simulation */}
          {callActive ? (
            <div className="call-active-box">
              <div className="call-pulsing-rings">
                <FiPhoneCall size={28} />
              </div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginTop: '0.75rem' }}>
                Calling Rahul Verma...
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Secure masked line • +91 98765-43210
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => setCallActive(false)}
              >
                End Call
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleStartCall}>
                <FiPhone /> Call Rider Now
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  navigator.clipboard?.writeText('+919876543210');
                  showToast('Courier contact copied: +91 98765-43210', 'info');
                }}
              >
                Copy Number
              </button>
            </div>
          )}

          {/* Delivery Note / Drop-off Instructions */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Quick Drop-off Instructions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quickInstructions.map((inst, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-instruction-pill"
                  onClick={() => handleSendInstruction(inst)}
                  disabled={instructionSent}
                >
                  <span>{inst}</span>
                  <FiCheck className="inst-check-icon" />
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Custom note for rider (e.g. lift is out of order)..."
                  className="form-select-custom"
                  style={{ flex: 1, padding: '0.6rem 0.85rem' }}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!customNote.trim()}
                  onClick={() => {
                    handleSendInstruction(customNote);
                    setCustomNote('');
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderContactModal;
