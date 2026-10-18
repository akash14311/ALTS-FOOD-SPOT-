import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '540px' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🍕🍽️</div>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Oops! Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Looks like this dish isn’t on our menu! The page you’re looking for might have moved or doesn’t exist.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <FiHome /> Back to Home
          </Link>
          <Link to="/restaurants" className="btn btn-secondary">
            <FiSearch /> Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
