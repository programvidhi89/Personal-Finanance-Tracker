function TransactionList({ transactions, onDelete, onEdit }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
        </svg>
        <p style={{ fontSize: '1.1rem' }}>No transactions found.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>Add your first transaction to see it here!</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map(t => (
        <div key={t.id} className="transaction-item">
          <div className="transaction-details">
            <div className="transaction-desc">
              {t.description || 'No description'}
              <span className="badge">{t.category}</span>
            </div>
            <div className="transaction-meta">
              {new Date(t.transactionDate).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={`transaction-amount ${t.type === 'INCOME' ? 'income' : 'expense'}`}>
              {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => onEdit(t)} 
                className="btn" 
                style={{ width: 'auto', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', boxShadow: 'none' }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(t.id)} 
                className="btn" 
                style={{ width: 'auto', padding: '0.4rem 0.8rem', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--expense-color)', boxShadow: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
