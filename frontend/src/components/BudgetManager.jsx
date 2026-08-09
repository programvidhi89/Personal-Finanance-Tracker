import { useState, useEffect } from 'react';
import axios from 'axios';

function BudgetManager({ transactions }) {
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.amount) return;
    
    try {
      const res = await axios.post('http://localhost:8080/api/budgets', {
        ...newBudget,
        monthYear: new Date().toISOString().slice(0, 7) // Current month '2026-08'
      });
      setBudgets([...budgets, res.data]);
      setNewBudget({ category: '', amount: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate spent amounts for the current month
  const currentMonthTransactions = transactions.filter(t => 
    t.type === 'EXPENSE' && t.transactionDate.startsWith(new Date().toISOString().slice(0, 7))
  );

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🎯 Budget Management
      </h2>

      <form onSubmit={handleAddBudget} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Category (e.g. Food)" 
          className="form-control" 
          value={newBudget.category}
          onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
          style={{ flex: 1, minWidth: '150px' }}
        />
        <input 
          type="number" 
          placeholder="Limit Amount" 
          className="form-control" 
          value={newBudget.amount}
          onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
          style={{ flex: 1, minWidth: '150px' }}
        />
        <button type="submit" className="btn" style={{ width: 'auto' }}>Set Budget</button>
      </form>

      {isLoading ? <div className="spinner"></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {budgets.map(budget => {
            const spent = currentMonthTransactions
              .filter(t => t.category.toLowerCase() === budget.category.toLowerCase())
              .reduce((sum, t) => sum + t.amount, 0);
            
            const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
            const isExceeded = spent > budget.amount;

            return (
              <div key={budget.id} style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{budget.category}</strong>
                  <span>₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}</span>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: isExceeded ? 'var(--expense-color)' : 'var(--accent-blue)',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: isExceeded ? 'var(--expense-color)' : 'var(--text-secondary)' }}>
                  <span>{percentage}% Used</span>
                  {isExceeded && <strong>⚠️ Budget exceeded!</strong>}
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No budgets set. Create one above!</p>}
        </div>
      )}
    </div>
  );
}

export default BudgetManager;
