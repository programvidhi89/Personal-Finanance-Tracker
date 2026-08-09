import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AnalyticsDashboard({ transactions }) {
  // Current month prefix e.g., '2026-08'
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(t => t.transactionDate.startsWith(currentMonthPrefix));

  const analytics = useMemo(() => {
    // 1. Highest Spending Category (Current Month)
    const categoryTotals = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    let highestCategory = 'None';
    let highestAmount = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > highestAmount) {
        highestAmount = amt;
        highestCategory = cat;
      }
    }

    // 2. Average Daily Spending (Current Month)
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    
    const totalCurrentMonthExpense = currentMonthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const averageDaily = totalCurrentMonthExpense / currentDay;

    // 3. Monthly Spending Trend (Last 6 Months)
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      const prefix = d.toISOString().slice(0, 7);
      monthlyData[prefix] = { monthStr, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const prefix = t.transactionDate.slice(0, 7);
      if (monthlyData[prefix]) {
        if (t.type === 'INCOME') monthlyData[prefix].income += t.amount;
        if (t.type === 'EXPENSE') monthlyData[prefix].expense += t.amount;
      }
    });

    return {
      highestCategory,
      highestAmount,
      averageDaily,
      monthlyData: Object.values(monthlyData)
    };
  }, [transactions, currentMonthTransactions]);

  const barChartData = {
    labels: analytics.monthlyData.map(d => d.monthStr),
    datasets: [
      {
        label: 'Income',
        data: analytics.monthlyData.map(d => d.income),
        backgroundColor: 'rgba(52, 211, 153, 0.8)', // income-color
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: analytics.monthlyData.map(d => d.expense),
        backgroundColor: 'rgba(244, 63, 94, 0.8)', // expense-color
        borderRadius: 4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#a1a1aa' } },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a1a1aa' } },
      x: { grid: { display: false }, ticks: { color: '#a1a1aa' } }
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📊 Monthly Analytics
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Highest Spending Category</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{analytics.highestCategory}</div>
          <div style={{ color: 'var(--expense-color)', fontSize: '0.9rem', marginTop: '0.25rem' }}>₹{analytics.highestAmount.toLocaleString()}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Average Daily Spending</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>₹{Math.round(analytics.averageDaily || 0).toLocaleString()}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>This month</div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Income vs Expense Trend</h3>
        <div style={{ height: '300px' }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
