import { useEffect, useState } from "react";
import { getTransaction } from "../db";

export default function Debts({ sDs, type }) {
  const [txMap, setTxMap] = useState({});
  const isExpense = type === "expense";

  useEffect(() => {
    async function loadTransactions() {
      const map = {};
      for (const d of sDs) {
        const t = await getTransaction(d.transactionId);
        map[d.transactionId] = t.description;
      }
      setTxMap(map);
    }
    if (sDs?.length) loadTransactions();
  }, [sDs]);

  return (
    <>
      {sDs?.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
            {isExpense
              ? "🚨 Bro, clear these debts!"
              : "🤑 Yo! Cash incoming soon"}
          </h2>

          {sDs.map((d, i) => (
            <p
              key={d.transactionId}
              style={{
                ...styles.pS,
                background: isExpense ? "#ffe6e6" : "#e6f7ff",
              }}
            >
              <span>
                {i + 1}.{" "}
                {isExpense
                  ? `Pay Ksh ${d.amountOwed} to ${d.debtorName} for `
                  : `${d.debtorName} will pay you Ksh ${d.amountOwed} for `}
                <strong style={{ color: isExpense ? "red" : "blue" }}>
                  {txMap[d.transactionId] || "What you agreed"}
                </strong>{" "}
                {isExpense ? "💸 expense" : "💰 income"}
              </span>

              {isExpense ? (
                <span style={{ fontSize: "1.2rem" }}>😬</span>
              ) : (
                <span style={{ fontSize: "1.2rem" }}>🔥</span>
              )}
            </p>
          ))}
        </>
      )}
    </>
  );
}

const styles = {
  pS: {
    padding: "8px 12px",
    borderRadius: "12px",
    margin: "6px 0",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};
