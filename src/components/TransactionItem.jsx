import { useState } from "react";
import "../styles/TransactionItem.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

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
      </li>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="transaction-modal"
        overlayClassName="modal-overlay"
        closeTimeoutMS={300} // 👈 for smooth exit
      >
        <div className="modal-content">
          <h2>Transaction Details</h2>
          <p>
            This is a <b>{transaction.description}</b>{" "}
            {transaction.type === "income" ? "income" : "expense"}.
          </p>
          <p>
            Amount: <b>Ksh {transaction.amount}</b>
          </p>
          {transaction.deposit && (
            <p>
              Paid: <b>Ksh {transaction.deposit}</b> via{" "}
              <b>{transaction.paymentMethod}</b>
            </p>
          )}
          {transaction.deposit && (
            <p>
              Balance: <b>Ksh {transaction.amount - transaction.deposit}</b>
            </p>
          )}
          {transaction.debtorName && (
            <p>
              Customer: <b>{transaction.debtorName}</b> (
              {transaction.debtorNumber || "N/A"})
            </p>
          )}

          <button className="close-btn" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
