import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/expenses';
const AUTH_BASE = 'http://localhost:5000/api/auth';

function App() {
  const [view, setView] = useState('landing'); 
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0 });
  
  // State for logged in user and forms
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
    } catch (err) { console.log("Fetch failed", err); }
  };

  useEffect(() => { if(view === 'dashboard') fetchData(); }, [view]);

  // --- SIGNUP & SIGNIN LOGIC ---
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = view === 'signup' ? '/register' : '/login';
    try {
      const res = await axios.post(`${AUTH_BASE}${endpoint}`, authForm);
      if (view === 'signup') {
        alert("Registration Successful! Please Login.");
        setView('login'); // Move to login after signing up
      } else {
        setUser(res.data.name);
        setView('dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Error - Check Backend");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE, form); 
      setForm({ ...form, title: '', amount: '' });
      fetchData();
    } catch (err) { alert("Error saving to database"); }
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API_BASE}/${id}`);
    fetchData();
  };

  // --- VIEWS ---
  if (view === 'landing') return (
    <div style={styles.centerView}>
      <h1 style={{color: '#1a73e8', fontSize: '3rem'}}>SpendWise 💸</h1>
      <p>Smart Expense & Subscription Tracking</p>
      <button style={styles.btnPrimary} onClick={() => setView('signup')}>Start Tracking (₹)</button>
    </div>
  );

  if (view === 'login' || view === 'signup') return (
    <div style={styles.centerView}>
      <div style={styles.authCard}>
        <h2>{view === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <form onSubmit={handleAuth}>
          {view === 'signup' && (
            <input style={styles.input} placeholder="Full Name" onChange={e => setAuthForm({...authForm, name: e.target.value})} required />
          )}
          <input style={styles.input} type="email" placeholder="Email" onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Password" onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
          <button type="submit" style={styles.btnPrimary}>{view === 'login' ? 'Login' : 'Sign Up'}</button>
        </form>
        <p style={{marginTop: '15px'}}>
          {view === 'login' ? "New user? " : "Already have an account? "}
          <span style={{color: '#1a73e8', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => setView(view === 'login' ? 'signup' : 'login')}>
            {view === 'login' ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Namaste, {user}! 🙏</h2>
        <button style={styles.btnSecondary} onClick={() => { setUser(null); setView('landing'); }}>Logout</button>
      </div>

      <div style={styles.summaryBox}>
        <h3 style={{margin: 0}}>Total Spending: ₹{summary.totalSpent}</h3>
      </div>

      <div style={styles.formBox}>
        <form onSubmit={handleSave} style={{display: 'flex', gap: '10px'}}>
          <select style={styles.inputSmall} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="expense">Expense</option>
            <option value="subscription">Subscription</option>
          </select>
          <input style={styles.inputSmall} placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input style={styles.inputSmall} type="number" placeholder="₹ Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          <button type="submit" style={styles.btnPrimary}>Add</button>
        </form>
      </div>

      <h3>Recent Transactions</h3>
      {items.map(item => (
        <div key={item._id} style={styles.listItem}>
          <span><strong>{item.title}</strong> <small style={styles.tag}>{item.category}</small></span>
          <span>
            <b style={{marginRight: '15px'}}>₹{item.amount}</b>
            <button onClick={() => deleteItem(item._id)} style={styles.delBtn}>x</button>
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  centerView: { textAlign: 'center', marginTop: '10%', fontFamily: 'Arial' },
  authCard: { maxWidth: '350px', margin: 'auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { display: 'block', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' },
  inputSmall: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 },
  btnPrimary: { background: '#1a73e8', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' },
  summaryBox: { background: '#e8f0fe', padding: '20px', borderRadius: '10px', color: '#1967d2', marginBottom: '20px' },
  formBox: { background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px' },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee' },
  tag: { marginLeft: '10px', color: '#666', background: '#eee', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' },
  delBtn: { color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }
};

export default App;