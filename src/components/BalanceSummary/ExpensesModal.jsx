// src/components/BalanceSummary/ExpensesModal.jsx
export default function ExpensesModal({ ts, transactions }) {
  return (
    <>
      <h2>💸 Total Expenses Today</h2>
      <p>
        You’ve spent{" "}
        <b>Ksh {(ts.paidExpense + ts.expenseDeposits).toFixed(2)}</b> today.
        Every shilling’s accounted for — keep flexing that budgeting. 📊
      </p>

      <h3 style={{ marginTop: "1rem" }}>📝 Expense Breakdown</h3>
      <ol style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
        {transactions
          .filter((t) => t.type === "expense")
          .map((t) => (
            <li key={t.id} style={{ marginBottom: "0.6rem" }}>
              {t.description} — <b>Ksh {t.amount.toFixed(2)}</b>{" "}
              {t.paymentStatus === "paid" ? (
                <span style={{ color: "green" }}>(Paid in full)</span>
              ) : (
                <span style={{ color: "orange" }}>
                  (Partial {t.deposit || 0} / Balance{" "}
                  {t.amount - (t.deposit || 0)})
                </span>
              )}
            </li>
          ))}
      </ol>
      <p>
        You still need to pay Ksh {ts.unpaidExpense}. So you'll have spent a
        total of Ksh {ts.paidExpense + ts.unpaidExpense}.
      </p>
    </>
  );
}
