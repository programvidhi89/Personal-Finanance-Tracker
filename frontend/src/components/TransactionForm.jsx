import { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Food', 'Shopping', 'Travel', 'Rent', 'Bills', 'Entertainment', 'Medical', 'Education', 'Salary', 'Investment', 'Other'];

function TransactionForm({ onAdd, initialData, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: CATEGORIES[0],
    accountId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    type: 'EXPENSE'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amount: initialData.amount.toString(),
        accountId: initialData.accountId || ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    // Fetch accounts to populate dropdown
    axios.get(import.meta.env.VITE_API_BASE_URL + '/accounts')
      .then(res => {
        setAccounts(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, accountId: res.data[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.transactionDate) return;
    
    setIsSubmitting(true);
    await onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
      accountId: formData.accountId ? parseInt(formData.accountId) : null
    });
    
    // Reset form unless editing
    if (!initialData) {
      setFormData(prev => ({ ...prev, amount: '', description: '' }));
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Type</label>
        <select 
          name="type" 
          value={formData.type} 
          onChange={handleChange} 
          className="form-control"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>

      <div className="form-group">
        <label>Amount (₹)</label>
        <input 
          type="number" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          className="form-control" 
          placeholder="e.g. 1500"
          required 
          min="0"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          className="form-control"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Account</label>
        <select 
          name="accountId" 
          value={formData.accountId} 
          onChange={handleChange} 
          className="form-control"
          required={accounts.length > 0}
        >
          {accounts.length === 0 && <option value="">No Accounts Found</option>}
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>
          ))}
        </select>
        {accounts.length === 0 && <small style={{color:'var(--expense-color)', marginTop:'4px', display:'block'}}>Please create an account first.</small>}
      </div>

      <div className="form-group">
        <label>Date</label>
        <input 
          type="date" 
          name="transactionDate" 
          value={formData.transactionDate} 
          onChange={handleChange} 
          className="form-control" 
          required 
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input 
          type="text" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          className="form-control" 
          placeholder="e.g. Dinner with friends"
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn" disabled={isSubmitting} style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed', flex: 1 } : { flex: 1 }}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Transaction' : 'Add Transaction')}
        </button>
        {initialData && (
          <button type="button" onClick={onCancel} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TransactionForm;
