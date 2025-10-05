// src/components/BalanceSummary/IncomeModal.jsx
export default function IncomeModal({ totals, incomeTotals, methodIcons }) {
  const totalIncome = Object.values(totals).reduce((acc, arr) => acc + arr, 0);
  return (
    <>
      <h2>💰 Total Income Today</h2>
      {totalIncome > 0 && (
        <p>Here’s the breakdown of where the money flowed in:</p>
      )}
      <ul>
        {Object.entries(incomeTotals)
          .filter(([_, balance]) => _ && balance > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([method, balance]) => (
            <li key={method}>
              {methodIcons[method.toLowerCase()] || "💳"}{" "}
              <b>{method.toUpperCase()}</b>: Ksh {balance.toLocaleString()}
            </li>
          ))}
      </ul>
      {totalIncome > 0 ? (
        <p>
          🔥 In total, you pulled in <b>Ksh {totalIncome.toFixed(2)}</b>. Keep
          working! 🚀 May God bless the work of your hands
        </p>
      ) : (
        <p>
          Today you haven't gotten anything. Take heart and keep pressing on
        </p>
      )}
    </>
  );
}
