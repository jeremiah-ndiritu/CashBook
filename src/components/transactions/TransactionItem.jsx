import { useState } from "react";
import "./TransactionItem.css";
import TransactionItemModal from "./TransactionItemModal";
import { timeAgo } from "../../utils/utils";

export default function TransactionItem({ transaction }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <li
        className={`transaction-item ${
          transaction.type === "income" ? "income" : "expense"
        }`}
        onClick={() => setIsOpen(true)}
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
        <div className="time-ago">{timeAgo(transaction.date)}</div>
      </li>
      <TransactionItemModal
        transaction={transaction}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
