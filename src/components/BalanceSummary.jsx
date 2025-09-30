// src/components/BalanceSummary.jsx
import "../styles/BalanceSummary.css";

export default function BalanceSummary({ transactions }) {
  // Group transactions by type + status
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

  // Real cash balance (only paid amounts)
  const realBalance = paidIncome - paidExpense;

  // Outstanding (expected inflows - owed outflows)
  const pendingBalance = creditIncome - debtExpense;

  return (
    <div className="balance-summary">
      <h2 className="balance-title">Balance Summary</h2>

      <table className="balance-table">
        <thead>
          <tr>
            <th>Credit (In)</th>
            <th>Debit (Out)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Received: Ksh {paidIncome}</td>
            <td>Spent: Ksh {paidExpense}</td>
          </tr>
          <tr>
            <td>Pending (to receive): Ksh {creditIncome}</td>
            <td>Debts (owed to others): Ksh {debtExpense}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2">
              <strong>Real Balance:</strong> Ksh {realBalance} <br />
              <strong>Pending Balance:</strong> Ksh {pendingBalance} <br />
              <strong>Total (if all paid):</strong> Ksh{" "}
              {realBalance + pendingBalance}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
