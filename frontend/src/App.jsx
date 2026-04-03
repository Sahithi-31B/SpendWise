import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api/expenses';
const AUTH_BASE = 'http://localhost:5000/api/auth';

const ProfileDropdown = ({ user, onProfile, onSettings, onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="profile-dropdown-wrapper" onClick={() => setOpen(!open)}>
      <button className="profile-avatar" aria-label="Open Profile Menu">{user?.[0]?.toUpperCase() || 'U'}</button>
      <div className={`profile-dropdown ${open ? 'open' : ''}`}>
        <button type="button" onClick={onProfile}>Profile</button>
        <button type="button" onClick={onSettings}>Settings</button>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

const Header = ({ user, onNavigate, onLogin, onSignup, onLogout }) => (
  <header className="app-header bg-gradient-to-r from-blue-500 to-blue-600 shadow-md text-white">
    <div className="header-left">
      <div className="logo-lockup" role="img" aria-label="SpendWise logo">
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
          <button className="header-btn" type="button" onClick={onLogin}>Login</button>
          <button className="header-btn header-btn-primary" type="button" onClick={onSignup}>Get Started</button>
        </>
      ) : (
        <ProfileDropdown user={user} onProfile={() => alert('Profile clicked')} onSettings={() => alert('Settings clicked')} onLogout={onLogout} />
      )}
    </div>
  </header>
);

const Footer = () => (
  <footer className="app-footer bg-gradient-to-r from-blue-500 to-blue-600 border-t border-white/30">
    <div className="footer-links">
      <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
      <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
      <a href="#" onClick={(e) => e.preventDefault()}>About</a>
    </div>
    <p className="footer-copyright">© 2026 All rights reserved</p>
  </footer>
);

function App() {
  const [view, setView] = useState('landing');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0 });

  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense' });

  const fetchData = async () => {
    try {
      const [resList, resSum] = await Promise.all([axios.get(API_BASE), axios.get(`${API_BASE}/summary`)]);
      setItems(resList.data);
      setSummary(resSum.data);
    } catch (err) {
      console.log('Fetch failed', err);
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
      alert('Error saving to database');
    }
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API_BASE}/${id}`);
    fetchData();
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const handleNavigate = (target) => {
    if (target === 'dashboard' && !user) {
      setView('login');
      return;
    }
    setView(target);
  };

  if (view === 'about') {
    return (
      <div className="app-shell">
        <Header user={user} onNavigate={handleNavigate} onLogin={() => setView('login')} onSignup={() => setView('signup')} onLogout={handleLogout} />
        <main className="content-area">
          <section className="about-card">
            <h2>About SpendWise</h2>
            <p>SpendWise is your modern spend tracker. Plan budgets, monitor subscriptions, and stay in control.</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="app-shell">
        <Header user={user} onNavigate={handleNavigate} onLogin={() => setView('login')} onSignup={() => setView('signup')} onLogout={handleLogout} />
        <main className="hero">
          <h1 className="hero-title">SpendWise</h1>
          <p className="hero-subtitle">Smart Expense & Subscription Tracking</p>
          <div className="hero-cta">
            <button className="btn-primary" type="button" onClick={() => setView('signup')}>Start Tracking →</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'login' || view === 'signup') {
    return (
      <div className="app-shell">
        <Header user={user} onNavigate={handleNavigate} onLogin={() => setView('login')} onSignup={() => setView('signup')} onLogout={handleLogout} />
        <main className="content-area auth-page">
          <div className="auth-card">
            <h2>{view === 'login' ? 'Sign In' : 'Create Account'}</h2>
            <form onSubmit={handleAuth} className="auth-form">
              {view === 'signup' && (
                <input className="input-field" placeholder="Full Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
              )}
              <input className="input-field" type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
              <input className="input-field" type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
              <button className="btn-primary" type="submit">{view === 'login' ? 'Login' : 'Sign Up'}</button>
            </form>
            <p className="auth-toggle">
              {view === 'login' ? 'New user? ' : 'Already have an account? '}
              <button className="auth-link" type="button" onClick={() => setView(view === 'login' ? 'signup' : 'login')}>
                {view === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header user={user} onNavigate={handleNavigate} onLogin={() => setView('login')} onSignup={() => setView('signup')} onLogout={handleLogout} />
      <main className="content-area dashboard-area">
        <div className="dashboard-top">
          <h2 className="welcome-title">Namaste, {user}! 🙏</h2>
        </div>
        <div className="summary-card">
          <h3>Total Spending: ₹{summary.totalSpent}</h3>
        </div>
        <div className="form-card">
          <form onSubmit={handleSave} className="transaction-form">
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="subscription">Subscription</option>
            </select>
            <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="input-field" type="number" placeholder="₹ Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <button className="btn-primary" type="submit">Add</button>
          </form>
        </div>
        <h3 className="section-title">Recent Transactions</h3>
        {items.map((item) => (
          <div key={item._id} className="transaction-item">
            <span>
              <strong>{item.title}</strong> <small className="tag">{item.category}</small>
            </span>
            <span>
              <b>₹{item.amount}</b>
              <button className="del-btn" type="button" onClick={() => deleteItem(item._id)}>x</button>
            </span>
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}

export default App;
