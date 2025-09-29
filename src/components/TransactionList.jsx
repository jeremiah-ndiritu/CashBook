// src/components/TransactionList.jsx
import TransactionItem from "./TransactionItem";
import "../styles/TransactionList.css";

export default function TransactionList({ transactions }) {
  if (transactions.length === 0) {
    return <p className="no-transactions">No transactions yet.</p>;
  }

  return (
    <ul className="transaction-list">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} />
      ))}
    </ul>
  );
}
