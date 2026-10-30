import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiShield, FiFileText, FiHelpCircle, FiUsers, FiBriefcase } from 'react-icons/fi';

const pageData = {
  '/about': {
    title: 'About ALTS FOOD spot',
    subtitle: 'Connecting food lovers with the finest kitchens across the city.',
    icon: <FiUsers size={32} color="var(--primary)" />,
    content: (
      <div>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          Welcome to <strong>ALTS FOOD spot</strong> — where cravings meet unmatched speed. We started with a simple belief: great food shouldn’t take forever, and everyone deserves access to fresh, hygienic, and authentic dishes from beloved local eateries.
        </p>
        <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
          Whether it’s late-night aromatic Dum Biryani, stone-baked artisanal pizzas, crispy street snacks, or wholesome south Indian dosas, our fleet runs round the clock to deliver pure joy to your doorstep.
        </p>
        <h3 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Our Core Pillars</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
          <li><strong>Lightning Fast Delivery:</strong> Real-time tracking and optimized local routes.</li>
          <li><strong>Hygiene Verified:</strong> Strict quality checks on all partner restaurant kitchens.</li>
          <li><strong>Zero Hidden Fees:</strong> Complete transparency in delivery fees and taxes.</li>
        </ul>
      </div>
    )
  },
  '/contact': {
    title: 'Contact Us',
    subtitle: 'We are here to help! Reach out anytime for order support or business inquiries.',
    icon: <FiMail size={32} color="var(--primary)" />,
    content: (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <FiPhone size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <h4>Customer Helpline</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>+91 (800) 123-4567</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Available 24/7 for live order help</span>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <FiMail size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <h4>Email Support</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>support@altsfoodspot.com</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Response within 2 hours</span>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <FiMapPin size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
            <h4>Headquarters</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Tech Innovation Hub, Bangalore, India</p>
          </div>
        </div>
      </div>
    )
  },
  '/careers': {
    title: 'Work With ALTS FOOD spot',
    subtitle: 'Build the next generation of hyper-local logistics and customer delight.',
    icon: <FiBriefcase size={32} color="var(--primary)" />,
    content: (
      <div>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
          At ALTS FOOD spot, our engineering and operations teams tackle challenging engineering, route optimization, and customer satisfaction problems daily.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>Frontend Software Engineer (React / Vite)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bangalore / Remote • Full Time</p>
            </div>
            <Link to="/contact" className="btn btn-primary btn-sm">Apply Now</Link>
          </div>
          <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>Backend Systems Engineer (Node.js / Express / Mongo)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bangalore / Remote • Full Time</p>
            </div>
            <Link to="/contact" className="btn btn-primary btn-sm">Apply Now</Link>
          </div>
        </div>
      </div>
    )
  },
  '/privacy': {
    title: 'Privacy Policy',
    subtitle: 'Your privacy and data safety are of utmost importance to us.',
    icon: <FiShield size={32} color="var(--primary)" />,
    content: (
      <div style={{ lineHeight: '1.8' }}>
        <p style={{ marginBottom: '1rem' }}>
          ALTS FOOD spot collects only the data necessary to deliver your orders accurately and securely: your name, contact phone number, delivery addresses, and encrypted authentication tokens.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          We never store full credit or debit card numbers on our servers. All payment handling is secured with end-to-end tokenization and industry standard SSL/TLS encryption.
        </p>
      </div>
    )
  },
  '/terms': {
    title: 'Terms & Conditions',
    subtitle: 'Guidelines governing the usage of ALTS FOOD spot services and ordering platform.',
    icon: <FiFileText size={32} color="var(--primary)" />,
    content: (
      <div style={{ lineHeight: '1.8' }}>
        <p style={{ marginBottom: '1rem' }}>
          By creating an account and placing orders on ALTS FOOD spot, you agree to provide accurate delivery and contact information.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          <strong>Cancellations:</strong> Users may cancel orders while they are in "Placed" or "Accepted" states without any cancellation penalties. Once preparation begins, cancellation cannot be processed.
        </p>
      </div>
    )
  },
  '/help': {
    title: 'Help & FAQs',
    subtitle: 'Frequently asked questions about ordering, delivery, and payments.',
    icon: <FiHelpCircle size={32} color="var(--primary)" />,
    content: (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
            <h4>How do I track my active order?</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Head to "My Orders" from the profile menu and click "Track Order". You will see an animated live timeline showing exactly when your order is placed, accepted, prepared, and out for delivery.
            </p>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
            <h4>Can I order from multiple restaurants at once?</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              To ensure swift delivery and food freshness, each order must originate from a single restaurant. If you add items from a second restaurant, you will be prompted to clear or replace your cart.
            </p>
          </div>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
            <h4>How do coupons work?</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Check out our "Offers" tab for coupon codes like CRAVE10 or FIRST50. Simply enter or click them in your cart to instantly discount your subtotal!
            </p>
          </div>
        </div>
      </div>
    )
  }
};

const StaticPage = () => {
  const location = useLocation();
  const page = pageData[location.pathname] || pageData['/about'];

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            {page.icon}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem' }}>{page.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
              {page.subtitle}
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-color)',
          marginTop: '2rem'
        }}>
          {page.content}
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
