// src/components/BalanceSummary.jsx
import "../styles/BalanceSummary.css";

export default function BalanceSummary({ transactions }) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  return (
    <div className="balance-summary">
      <h2 className="balance-title">Balance: Ksh {balance}</h2>
      <p className="income">Income: Ksh {income}</p>
      <p className="expense">Expense: Ksh {expense}</p>
    </div>
  );
}
