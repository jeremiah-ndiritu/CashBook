// src/components/BalanceSummary.jsx
import "../styles/BalanceSummary.css";
import { getLocalDateKey } from "../utils/utils";
export default function BalanceSummary({ transactions }) {
  const now = new Date();
  const todayKey = getLocalDateKey(now);
  transactions = transactions.filter((t) => t.dayKey == todayKey);

  const paidIncome = transactions
    .filter((t) => t.type === "income" && t.paymentStatus === "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const creditIncome = transactions
    .filter((t) => t.type === "income" && t.paymentStatus !== "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const paidExpense = transactions
    .filter((t) => t.type === "expense" && t.paymentStatus === "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const debtExpense = transactions
    .filter((t) => t.type === "expense" && t.paymentStatus !== "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const realBalance = paidIncome - paidExpense;

  return (
    <div className="balance-summary-grid">
      <div className="balance-card">
        <h4>Total Income Today</h4>
        <p>Ksh {paidIncome.toFixed(2)}</p>
      </div>
      <div className="balance-card">
        <h4>Total Debts Today</h4>
        <p>Ksh {creditIncome + debtExpense}</p>
      </div>
      <div className="balance-card">
        <h4>Total Expenses Today</h4>
        <p>Ksh {paidExpense.toFixed(2)}</p>
      </div>
      <div
        className={`balance-card ${realBalance < 0 ? "balance-negative" : ""}`}
      >
        <h4>Current Balance</h4>
        <p>Ksh {realBalance.toFixed(2)}</p>
      </div>
    </div>
  );
}
