import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseChart from '../components/ExpenseChart';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- BUDGET CONFIGURATION ---
  const MONTHLY_BUDGET = 15000;

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (newExpense) => {
    try {
      const res = await API.post('/expenses', newExpense);
      setExpenses([res.data, ...expenses]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- FILTER & SEARCH LOGIC ---
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total based on ALL expenses (not just filtered) for budget check
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = MONTHLY_BUDGET - totalSpent;
  const isOverBudget = totalSpent > MONTHLY_BUDGET;
  
  // Calculate percentage for progress bar (max 100%)
  const budgetPercentage = Math.min((totalSpent / MONTHLY_BUDGET) * 100, 100);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>PennyWise</h2>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>
      
      {/* --- BUDGET SECTION --- */}
      <div className={`budget-section ${isOverBudget ? 'over-budget' : ''}`}>
        <div className="budget-header">
          <h3>Monthly Budget: ₹{MONTHLY_BUDGET.toLocaleString('en-IN')}</h3>
          <h3>Spent: ₹{totalSpent.toLocaleString('en-IN')}</h3>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${budgetPercentage}%`,
              backgroundColor: isOverBudget ? '#ef4444' : (budgetPercentage > 75 ? '#f59e0b' : '#10b981')
            }}
          ></div>
        </div>

        <div className="budget-warning">
          {isOverBudget ? (
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
              ⚠️ Warning: You have exceeded your monthly budget by ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}!
            </span>
          ) : (
            <span style={{ color: '#10b981' }}>
              ✅ Remaining Budget: ₹{remainingBudget.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>

      <div className="dashboard-top-section">
        <div className="total-box">
          <h3>Filtered Total Spent</h3>
          <p>₹{filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}</p>
        </div>
        
        <ExpenseChart expenses={filteredExpenses} />
      </div>

      <ExpenseForm onAdd={handleAddExpense} />

      {/* --- SEARCH AND FILTER BAR --- */}
      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="🔍 Search expenses..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* --- EXPENSE LIST --- */}
      <div className="expense-list">
        {filteredExpenses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>
            No expenses found.
          </p> 
        ) : (
          filteredExpenses.map((exp) => (
            <div key={exp._id} className="expense-item">
              <div className="expense-info">
                <strong>{exp.title}</strong>
                <span>{exp.category} • {new Date(exp.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="expense-amount">₹{exp.amount}</span>
                <button onClick={() => handleDelete(exp._id)} className="btn-delete">✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}