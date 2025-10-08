// src/components/BalanceSummary/BalanceModal.jsx
export default function BalanceModal({ totals, expenseTotals, actualBalance }) {
  return (
    <>
      <h2>📊 Current Balance</h2>
      <p>
        {actualBalance == 0 && (
          <>
            😎 No problem. You have no Ksh 0.00 left. Keep pushing. Never lose
            hope!
          </>
        )}
        {actualBalance > 0 ? (
          <>
            ✅ You’re up with <b>Ksh {actualBalance.toFixed(2)}</b> left. Chill
            and shine ✨
          </>
        ) : (
          <>
            ⚠ Red alert… you’re down by{" "}
            <b>Ksh {Math.abs(actualBalance).toFixed(2)}</b>. Maybe slow down the
            spending 👀
          </>
        )}
      </p>

      {actualBalance > 0 && (
        <>
          <h3 style={{ marginTop: "1.2rem" }}>💼 Breakdown per account</h3>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
            {Object.entries(totals).map(([acc, balance]) => (
              <li key={acc}>
                {acc.toUpperCase()} :{" "}
                {balance - expenseTotals[acc.toLowerCase()]}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
