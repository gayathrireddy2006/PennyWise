import { useState } from 'react';

export default function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    onAdd({ title, amount: Number(amount), category });
    setTitle('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <input placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '8px' }} />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '8px' }} />
      <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '8px' }}>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Shopping">Shopping</option>
        <option value="Bills">Bills</option>
        <option value="Other">Other</option>
      </select>
      <button type="submit" style={{ padding: '8px 15px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Expense</button>
    </form>
  );
}
