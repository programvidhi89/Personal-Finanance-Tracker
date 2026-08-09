import { useState, useEffect } from 'react';
import axios from 'axios';

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/goals');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;
    
    try {
      const res = await axios.post(import.meta.env.VITE_API_BASE_URL + '/goals', newGoal);
      setGoals([...goals, res.data]);
      setNewGoal({ name: '', targetAmount: '', deadline: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFunds = async (goalId) => {
    const amount = prompt("How much do you want to add to this goal?");
    if (amount && !isNaN(amount)) {
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/goals/${goalId}/add?amount=${amount}`);
        // Optimistically update UI
        setGoals(goals.map(g => g.id === goalId ? { ...g, savedAmount: g.savedAmount + parseFloat(amount) } : g));
      } catch (err) {
        console.error(err);
        alert("Failed to add funds");
      }
    }
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        💰 Savings Goals
      </h2>

      <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Goal Name (e.g. iPhone)" 
          className="form-control" 
          value={newGoal.name}
          onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
          style={{ flex: 1, minWidth: '150px' }}
        />
        <input 
          type="number" 
          placeholder="Target Amount" 
          className="form-control" 
          value={newGoal.targetAmount}
          onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
          style={{ flex: 1, minWidth: '150px' }}
        />
        <button type="submit" className="btn" style={{ width: 'auto' }}>Create Goal</button>
      </form>

      {isLoading ? <div className="spinner"></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {goals.map(goal => {
            const percentage = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));

            return (
              <div key={goal.id} style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.2rem', display: 'block' }}>{goal.name}</strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹{goal.savedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <button onClick={() => handleAddFunds(goal.id)} className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)' }}>+ Add Funds</button>
                </div>
                
                {/* Progress Bar */}
                <div style={{ height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem', marginTop: '1rem' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: percentage >= 100 ? 'var(--income-color)' : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    transition: 'width 0.5s ease-out'
                  }}></div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.9rem', color: percentage >= 100 ? 'var(--income-color)' : 'var(--text-secondary)' }}>
                  <strong>{percentage}%</strong> {percentage >= 100 ? 'Goal Reached! 🎉' : ''}
                </div>
              </div>
            );
          })}
          {goals.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No savings goals set. Create one above!</p>}
        </div>
      )}
    </div>
  );
}

export default SavingsGoals;
