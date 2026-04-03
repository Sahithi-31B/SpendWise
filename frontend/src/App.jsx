import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import HeroVisual from './components/HeroVisual'; 
import SpendChart from './components/SpendChart';
import './App.css';

const API_BASE = 'http://localhost:5000/api/expenses';
const AUTH_BASE = 'http://localhost:5000/api/auth';

// --- Components ---

const ProfileDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="profile-dropdown-wrapper" onClick={() => setOpen(!open)}>
      <button className="profile-avatar">
        {user?.[0]?.toUpperCase() || 'U'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="profile-dropdown open"
          >
            <button type="button" onClick={() => alert('Profile Clicked')}>Profile</button>
            <button type="button" onClick={() => alert('Settings Clicked')}>Settings</button>
            <button type="button" onClick={onLogout} className="logout-btn">Logout</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Header = ({ user, onNavigate, onLogin, onSignup, onLogout }) => (
  <header className="app-header">
    <div className="header-left">
      <div className="logo-lockup" onClick={() => onNavigate('landing')} style={{cursor: 'pointer'}}>
        <span className="logo-text">SpendWise 💸</span>
      </div>
    </div>

    <nav className="header-nav">
      <button type="button" className="nav-item" onClick={() => onNavigate('landing')}>Home</button>
      <button type="button" className="nav-item" onClick={() => onNavigate('dashboard')}>Dashboard</button>
      <button type="button" className="nav-item" onClick={() => onNavigate('about')}>About</button>
    </nav>

    <div className="header-right">
      {!user ? (
        <>
          <button className="header-btn header-btn-outline" onClick={onLogin}>Login</button>
          <button className="header-btn" onClick={onSignup}>Get Started</button>
        </>
      ) : (
        <ProfileDropdown user={user} onLogout={onLogout} />
      )}
    </div>
  </header>
);

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-links">
      <a href="#privacy">Privacy Policy</a>
      <a href="#contact">Contact</a>
      <a href="#about">About</a>
    </div>
    <p className="footer-copyright">© 2026 SpendWise • Built with Passion</p>
  </footer>
);

// --- Main App ---

function App() {
  const [view, setView] = useState('landing');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0 });
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense' });

  const fetchData = async () => {
    try {
      const [resList, resSum] = await Promise.all([
        axios.get(API_BASE), 
        axios.get(`${API_BASE}/summary`)
      ]);
      setItems(resList.data);
      setSummary(resSum.data);
    } catch (err) {
      console.error('Fetch failed', err);
    }
  };

  useEffect(() => {
    if (view === 'dashboard') fetchData();
  }, [view]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = view === 'signup' ? '/register' : '/login';
    try {
      const res = await axios.post(`${AUTH_BASE}${endpoint}`, authForm);
      if (view === 'signup') {
        alert('Registration Successful! Please Login.');
        setView('login');
      } else {
        // FIXED SYNTAX: Removed extra braces that caused the "Expected finally" error
        setItems([]); 
        setSummary({ totalSpent: 0 });
        setUser(res.data.name);
        setView('dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Auth Error - Check Backend');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE, form);
      setForm({ ...form, title: '', amount: '' });
      fetchData();
    } catch (err) {
      alert('Error saving transaction');
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setItems([]); 
    setSummary({ totalSpent: 0 }); 
    setView('landing');
  };

  const handleNavigate = (target) => {
    if (target === 'dashboard' && !user) {
      setView('login');
      return;
    }
    setView(target);
  };

  const renderContent = () => {
    switch (view) {
      case 'about':
        return (
          <motion.section 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="about-card"
          >
            <h2>About SpendWise</h2>
            <p>SpendWise is a high-performance spending tracker designed for the modern user. Stay ahead of your finances with real-time analytics.</p>
          </motion.section>
        );

      case 'landing':
        return (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="hero-section-wrapper" 
          >
            <div className="hero-content">
              <h1 className="hero-title">Master Your Money</h1>
              <p className="hero-subtitle">Smart visual tracking for expenses and subscriptions.</p>
              <button className="btn-primary" onClick={() => setView('signup')}>Start Free Trial →</button>
            </div>
            <HeroVisual />
          </motion.div>
        );

      case 'login':
      case 'signup':
        return (
          <div className="auth-page">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="auth-card"
            >
              <h2>{view === 'login' ? 'Welcome Back' : 'Join SpendWise'}</h2>
              <form onSubmit={handleAuth} className="auth-form">
                {view === 'signup' && (
                  <input className="input-field" placeholder="Full Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                )}
                <input className="input-field" type="email" placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
                <input className="input-field" type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
                <button className="btn-primary" type="submit">{view === 'login' ? 'Login' : 'Create Account'}</button>
              </form>
              <button className="auth-link" onClick={() => setView(view === 'login' ? 'signup' : 'login')}>
                {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </motion.div>
          </div>
        );

      // Inside your renderContent() under 'dashboard' case:
case 'dashboard':
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-container">
      {/* Top Welcome Header */}
      <div className="dashboard-header">
        <h2 className="welcome-title">Namaste, {user}! 🙏</h2>
        <div className="summary-mini-card">
          <span>Total Spent:</span>
          <b>₹{summary.totalSpent?.toLocaleString()}</b>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* LEFT SIDE: The Graph */}
        <div className="grid-left">
          <div className="glass-card chart-card">
            <h3>Expense Breakdown</h3>
            <div className="chart-wrapper">
              <SpendChart items={items} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: The Form and List */}
        <div className="grid-right">
          <div className="glass-card entry-card">
            <h3>Add New Transaction</h3>
            <form onSubmit={handleSave} className="transaction-form-vertical">
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="subscription">Subscription</option>
              </select>
              <input className="input-field" placeholder="What did you buy?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="input-field" type="number" placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              <button className="btn-primary" type="submit">Add Entry</button>
            </form>

            <div className="recent-activity-list">
              <h4>Recent Activity</h4>
              {/* Map your items here like before */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Header 
        user={user} 
        onNavigate={handleNavigate} 
        onLogin={() => setView('login')} 
        onSignup={() => setView('signup')} 
        onLogout={handleLogout} 
      />
      <main className="content-area">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;