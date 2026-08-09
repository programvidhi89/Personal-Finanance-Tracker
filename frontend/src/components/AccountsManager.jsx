import { useState, useEffect } from 'react';
import axios from 'axios';

function AccountsManager({ refreshTrigger }) {
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'BANK', balance: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, [refreshTrigger]);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.name) return;
    
    try {
      const res = await axios.post(import.meta.env.VITE_API_BASE_URL + '/accounts', {
        ...newAccount,
        balance: parseFloat(newAccount.balance || 0)
      });
      setAccounts([...accounts, res.data]);
      setNewAccount({ name: '', type: 'BANK', balance: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BANK': return '🏦';
      case 'CASH': return '💵';
      case 'CREDIT': return '💳';
      default: return '🏦';
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        💳 My Accounts
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {accounts.map(acc => (
          <div key={acc.id} style={{ 
            background: 'var(--surface-color)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '1.5rem' }}>{getIcon(acc.type)}</div>
            <div style={{ fontWeight: '600' }}>{acc.name}</div>
            <div style={{ fontSize: '1.2rem', color: acc.balance < 0 ? 'var(--expense-color)' : 'var(--income-color)' }}>
              ₹{acc.balance.toLocaleString()}
            </div>
          </div>
        ))}
        {accounts.length === 0 && !isLoading && (
          <div style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No accounts created yet.</div>
        )}
      </div>

      <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Account Name</label>
          <input 
            type="text" 
            placeholder="e.g. HDFC Bank" 
            className="form-control" 
            value={newAccount.name}
            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
            required
          />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Type</label>
          <select 
            className="form-control"
            value={newAccount.type}
            onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
          >
            <option value="BANK">Bank</option>
            <option value="CASH">Cash</option>
            <option value="CREDIT">Credit Card</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Initial Balance</label>
          <input 
            type="number" 
            placeholder="0" 
            className="form-control" 
            value={newAccount.balance}
            onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
          />
        </div>
        <button type="submit" className="btn" style={{ width: 'auto' }}>Add Account</button>
      </form>
    </div>
  );
}

export default AccountsManager;
