import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import HeroVisual from './components/HeroVisual'; 
import SpendChart from './components/SpendChart';
import './App.css';

const API_BASE = 'http://localhost:5000/api/expenses';
const AUTH_BASE = 'http://localhost:5000/api/auth';

// --- Shared Components ---

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
            <button type="button" onClick={() => alert('Profile')}>Profile</button>
            <button type="button" onClick={() => alert('Settings')}>Settings</button>
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
        <span className="logo-text">
          <span className="logo-brand">Spend</span><span className="logo-highlight">Wise</span>
        </span>
      </div>
    </div>
    <nav className="header-nav">
      <button type="button" className="nav-item" onClick={() => onNavigate('landing')}>Home</button>
      <button type="button" className="nav-item" onClick={() => onNavigate('dashboard')}>Dashboard</button>
      <button type="button" className="nav-item" onClick={() => onNavigate('reports')}>Reports</button>
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

// --- Main App Component ---

function App() {
  const [view, setView] = useState('landing');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0 });
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense' });
  
  const [budgetInput, setBudgetInput] = useState(localStorage.getItem('spendwise_budget') || 0);
  const [monthlyBudget, setMonthlyBudget] = useState(localStorage.getItem('spendwise_budget') || 0);
  
  const reportRef = useRef(null);

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

  const handleSetBudget = () => {
    setMonthlyBudget(budgetInput);
    localStorage.setItem('spendwise_budget', budgetInput);
    alert('Budget updated successfully!');
  };

  const handleDownloadPDF = async () => {
    const input = reportRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`SpendWise_Report.pdf`);
  };

  useEffect(() => {
    if (view === 'dashboard' || view === 'reports') fetchData();
  }, [view]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = view === 'signup' ? '/register' : '/login';
    try {
      const res = await axios.post(`${AUTH_BASE}${endpoint}`, authForm);
      if (view === 'signup') {
        setView('login');
      } else {
        setUser(res.data.name);
        setView('dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Auth Error');
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
    if(!window.confirm("Are you sure you want to delete this entry?")) return;
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
    if ((target === 'dashboard' || target === 'reports') && !user) {
      setView('login');
      return;
    }
    setView(target);
  };

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hero-section-wrapper">
            <div className="hero-content">
              <h1 className="hero-title">Master Your Money</h1>
              <p className="hero-subtitle">Smart visual tracker for expenses and subscriptions.</p>
              <button className="btn-primary" onClick={() => setView('signup')}>Start Free Trial →</button>
            </div>
            <HeroVisual />
          </motion.div>
        );

      case 'login':
      case 'signup':
        return (
          <div className="auth-page">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="auth-card">
              <h2>{view === 'login' ? 'Welcome Back' : 'Join SpendWise'}</h2>
              <form onSubmit={handleAuth} className="auth-form">
                {view === 'signup' && (
                  <div className="auth-field">
                    <label>Full Name</label>
                    <input className="input-field" id="auth-name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                  </div>
                )}
                <div className="auth-field">
                  <label>Email</label>
                  <input className="input-field" id="auth-email" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input className="input-field" id="auth-password" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
                </div>
                <button className="btn-primary" type="submit">{view === 'login' ? 'Login' : 'Create Account'}</button>
              </form>
            </motion.div>
          </div>
        );

      case 'dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-container">
            <h2 className="welcome-title">Welcome back, {user}! 🙏</h2>
            
            <div className="dashboard-grid">
              <div className="grid-left">
                {/* FINANCIAL OVERVIEW */}
                <div className="glass-card budget-card">
                   <h3>Financial Overview</h3>
                   <div className="budget-controls-vertical">
                        <div className="budget-input-group">
                            <label>Monthly Budget (₹): </label>
                            <input 
                              type="number" 
                              className="input-field budget-input"
                              value={budgetInput} 
                              onChange={(e) => setBudgetInput(e.target.value)} 
                            />
                            <button className="btn-primary" onClick={handleSetBudget}>Set Budget</button>
                        </div>
                        <div className="status-metrics">
                            <p>Spent: <b>₹{summary.totalSpent || 0}</b></p>
                            <p>Remaining: <b style={{ color: (monthlyBudget - (summary.totalSpent || 0)) < 0 ? '#ff4d4d' : '#10b981' }}>₹{(monthlyBudget - (summary.totalSpent || 0))}</b></p>
                        </div>
                   </div>
                </div>

                {/* ADD TRANSACTION */}
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
                </div>
              </div>

              <div className="grid-right">
                <div className="glass-card chart-card">
                  <h3>Expense Breakdown</h3>
                  <SpendChart items={items} />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'reports':
        const remaining = monthlyBudget - (summary.totalSpent || 0);
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-container">
            <div className="report-header-actions">
              <h2 className="welcome-title">Financial Reports, {user}!</h2>
              <button className="btn-primary" onClick={handleDownloadPDF}>Download PDF Report</button>
            </div>
            
  <div className="glass-card table-card" ref={reportRef}>
  <div className="report-pdf-header">
  <h3 style={{ color: '#6366f1', marginBottom: '15px' }}>Monthly Summary</h3>
  
  {/* Added display: flex to align items horizontally */}
  <div className="summary-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div className="stat-item">
      <p>Budget Limit</p>
      <b>₹{monthlyBudget}</b>
    </div>
    <div className="stat-item">
      <p>Total Spent</p>
      <b>₹{summary.totalSpent || 0}</b>
    </div>
    <div className="stat-item">
      <p>Balance Remaining</p>
      <b style={{ color: remaining < 0 ? '#ff4d4d' : '#10b981' }}>
        ₹{remaining}
      </b>
    </div>
  </div>
</div>

               <h3>Recent Activity Detail</h3>
               <table className="activity-table">
                 <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                 </thead>
                 <tbody>
                    {items.map((item) => (
                        <tr key={item._id}>
                            <td>{item.title}</td>
                            <td><span className={`badge ${item.category}`}>{item.category}</span></td>
                            <td>₹{item.amount}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                className="delete-btn" 
                                onClick={() => deleteItem(item._id)}
                                title="Delete Entry"
                              >
                                ✕
                              </button>
                            </td>
                        </tr>
                    ))}
                 </tbody>
               </table>
               
               {items.length === 0 && (
                 <p className="empty-msg">No transactions found for this period.</p>
               )}
            </div>
          </motion.div>
        );

      case 'about':
        return (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="about-card">
            <h2>About SpendWise</h2>
            <p>SpendWise is a high-performance spending tracker designed for the modern user. Built with the MERN stack and framed for speed.</p>
          </motion.section>
        );
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <Header user={user} onNavigate={handleNavigate} onLogin={() => setView('login')} onSignup={() => setView('signup')} onLogout={handleLogout} />
      <main className={`content-area ${view === 'landing' ? 'landing-content' : ''}`}>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;