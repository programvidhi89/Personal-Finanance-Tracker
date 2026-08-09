import { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';
import BudgetManager from '../components/BudgetManager';
import SavingsGoals from '../components/SavingsGoals';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AccountsManager from '../components/AccountsManager';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:8080/api/transactions';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, savings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const { logout, username } = useContext(AuthContext);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        `"${t.transactionDate}","${t.type}","${t.category}","${t.amount}","${t.description || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, sumRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${API_URL}/summary`)
      ]);
      setTransactions(transRes.data);
      setSummary(sumRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTransaction = async (transaction) => {
    try {
      if (editingTransaction) {
        await axios.put(`${API_URL}/${editingTransaction.id}`, transaction);
        setEditingTransaction(null);
      } else {
        await axios.post(API_URL, transaction);
      }
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ marginBottom: 0 }}>Finance Tracker</h1>
          {username && <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '1.1rem' }}>Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{username}</strong></div>}
        </div>
        <button onClick={logout} className="btn" style={{ width: 'auto', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--expense-color)', boxShadow: 'none' }}>Logout</button>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div className="spinner"></div>
          <h2>Loading your finances...</h2>
        </div>
      ) : (
        <>
          <div className="summary-grid">
            <div className="card summary-item">
              <div className="label">Total Income</div>
              <div className="amount income">₹{summary.totalIncome.toLocaleString('en-IN')}</div>
            </div>
            <div className="card summary-item">
              <div className="label">Total Expenses</div>
              <div className="amount expense">₹{summary.totalExpenses.toLocaleString('en-IN')}</div>
            </div>
            <div className="card summary-item">
              <div className="label">Total Savings</div>
              <div className="amount savings">₹{summary.savings.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="main-content">
            <div className="left-column">
              <AccountsManager refreshTrigger={transactions} />
              
              <AnalyticsDashboard transactions={transactions} />

              <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Expense Breakdown</h2>
                <ExpenseChart transactions={transactions} />
              </div>

              <div className="card" style={{ marginBottom: '2rem' }}>
                <BudgetManager transactions={transactions} />
              </div>

              <div className="card" style={{ marginBottom: '2rem' }}>
                <SavingsGoals />
              </div>
              
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ marginBottom: 0 }}>Recent Transactions</h2>
                  <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '250px', justifyContent: 'flex-end' }}>
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      className="form-control" 
                      style={{ padding: '0.6rem 1rem', maxWidth: '300px' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={handleExportCSV} className="btn" style={{ padding: '0.6rem 1rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Export
                    </button>
                  </div>
                </div>
                <TransactionList 
                  transactions={filteredTransactions} 
                  onDelete={handleDeleteTransaction}
                  onEdit={(t) => {
                    setEditingTransaction(t);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              </div>
            </div>
            
            <div className="right-column">
              <div className="card">
                <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <TransactionForm 
                  onAdd={handleSaveTransaction} 
                  initialData={editingTransaction}
                  onCancel={() => setEditingTransaction(null)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
