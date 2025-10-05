// src/components/BalanceSummary/DebtsModal.jsx
import DebtsSummary from "../debts/DebtsSummary";
export default function DebtsModal({ ts, ds }) {
  let td = ds.unclearedIncomingDebts.reduce(
    (sum, arr) => sum + arr.amountOwed,
    0
  );
  return (
    <>
      <h2>📉 Total Debts Today</h2>
      <p>
        🔻 Outgoing debts: <b>Ksh {ts.unpaidExpense}</b> (you owe this much).
        <br />
        🔺 Incoming debts: <b>Ksh {Math.abs(td)}</b> (others owe you this much).
      </p>
      <p>Make sure you pay the debts you owe to others. 🧾</p>
      <DebtsSummary sDs={ds.unclearedIncomingDebts} type={"income"} />
      <DebtsSummary sDs={ds.unclearedOutgoingDebts} type={"expense"} />
    </>
  );
}
