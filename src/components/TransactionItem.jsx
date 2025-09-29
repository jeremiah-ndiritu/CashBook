import "../styles/TransactionItem.css";

export default function TransactionItem({ transaction }) {
  return (
    <li
      className={`transaction-item ${
        transaction.type === "income" ? "income" : "expense"
      }`}
    >
      <div className="transaction-main">
        <span className="transaction-desc">{transaction.description}</span>
        <span className={`transaction-method ${transaction.paymentCategory}`}>
          {transaction.paymentMethod}
        </span>
      </div>
      <span className="transaction-amount">
        {transaction.type === "income" ? "+" : "-"} Ksh {transaction.amount}
      </span>
    </li>
  );
}
