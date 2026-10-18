import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiShoppingBag,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiPercent,
  FiHeart,
  FiLogOut,
  FiShield,
  FiList,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import { IoFastFoodOutline } from 'react-icons/io5';
import '../../styles/navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount, total } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="brand-icon-wrapper">
            <IoFastFoodOutline />
          </div>
          <div className="brand-name">
            <div className="brand-title">food<span>spot</span></div>
            <span className="brand-tagline">Your cravings. Our mission.</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/restaurants" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Restaurants
              </NavLink>
            </li>
            <li>
              <NavLink to="/offers" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <FiPercent style={{ color: 'var(--accent)' }} /> Offers
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <FiSearch /> Search
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          {/* Theme Switcher Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            id="theme-toggle-btn"
          >
            {isDark ? (
              <FiSun className="theme-icon-sun" />
            ) : (
              <FiMoon className="theme-icon-moon" />
            )}
          </button>

          {/* Cart Button */}
          <Link to="/cart" className="cart-btn" id="navbar-cart-btn" aria-label="Shopping Cart">
            <FiShoppingBag size={18} />
            <span className="cart-badge">{totalItemsCount}</span>
            {totalItemsCount > 0 && <span>₹{total}</span>}
          </Link>

          {/* Admin Dashboard Option (Beside Profile Option) */}
          {isAuthenticated && isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `admin-nav-pill ${isActive ? 'active' : ''}`}
              id="navbar-admin-pill"
              title="Admin Dashboard"
              onClick={closeMenu}
            >
              <FiShield size={16} />
              <span>Admin Dashboard</span>
              <span className="admin-nav-pill-dot" />
            </NavLink>
          )}

          {/* User Profile or Auth Trigger */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                className="user-menu-trigger"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                id="user-profile-menu-btn"
                aria-haspopup="true"
              >
                <div className="user-avatar-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    <FiUser /> Profile & Addresses
                  </Link>

                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    <FiList /> My Orders
                  </Link>

                  <Link
                    to="/favorites"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    <FiHeart /> Favorites
                  </Link>

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.2rem 0' }}></div>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item"
                    style={{ color: 'var(--danger)' }}
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="navbar-login-btn">
              Login
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.2rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Theme Mode</span>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <FiSun className="theme-icon-sun" /> : <FiMoon className="theme-icon-moon" />}
            </button>
          </div>

          <NavLink to="/" className="mobile-nav-link" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/restaurants" className="mobile-nav-link" onClick={closeMenu}>
            Restaurants
          </NavLink>
          <NavLink to="/offers" className="mobile-nav-link" onClick={closeMenu}>
            <FiPercent /> Offers
          </NavLink>
          <NavLink to="/search" className="mobile-nav-link" onClick={closeMenu}>
            <FiSearch /> Search Dishes & Restaurants
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className="mobile-nav-link" onClick={closeMenu}>
                <FiList /> My Orders
              </NavLink>
              <NavLink to="/favorites" className="mobile-nav-link" onClick={closeMenu}>
                <FiHeart /> Favorites
              </NavLink>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <NavLink to="/profile" className="mobile-nav-link" onClick={closeMenu} style={{ flex: 1 }}>
                  <FiUser /> Profile & Addresses
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="admin-nav-pill"
                    onClick={closeMenu}
                    style={{ padding: '0.65rem 0.95rem' }}
                    title="Admin Dashboard"
                  >
                    <FiShield /> Admin
                    <span className="admin-nav-pill-dot" />
                  </NavLink>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="mobile-nav-link"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                }}
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ flex: 1 }} onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
