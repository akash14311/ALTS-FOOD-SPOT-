import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiHeart } from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import '../../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="footer-brand-title">
              <IoFastFoodOutline style={{ color: 'var(--primary)', fontSize: '1.75rem' }} />
              food<span>spot</span>
            </div>
            <p className="footer-desc">
              Your cravings. Our mission. Delivering hot, mouthwatering meals from top local kitchens straight to your doorstep with lightning speed.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube">
                <FiYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/careers" className="footer-link">Careers</Link></li>
              <li><Link to="/restaurants" className="footer-link">Partner With Us</Link></li>
              <li><Link to="/offers" className="footer-link">Special Deals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="footer-col-title">Help & Support</h4>
            <ul className="footer-links">
              <li><Link to="/help" className="footer-link">Help & FAQs</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/orders" className="footer-link">Track Delivery</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="footer-col-title">Legal & Security</h4>
            <ul className="footer-links">
              <li><Link to="/terms" className="footer-link">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="footer-link">Security Policies</Link></li>
              <li><Link to="/about" className="footer-link">FSSAI Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} food spot Inc. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with <FiHeart style={{ color: 'var(--primary)' }} /> for foodies everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
