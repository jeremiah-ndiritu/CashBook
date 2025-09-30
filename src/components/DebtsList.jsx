// src/components/DebtsList.jsx
import { useEffect, useState } from "react";
import { getDebts } from "../db";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "../styles/DebtsList.css";

export default function DebtsList() {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    async function fetchDebts() {
      const storedDebts = await getDebts();
      setDebts(storedDebts);
    }
    fetchDebts();
  }, []);

  if (debts.length === 0) {
    return <p className="no-debts">No debts recorded yet.</p>;
  }

  return (
    <div className="debts-table-wrapper">
      <h3>Debts / Credit Records</h3>
      <table className="debts-table">
        <thead>
          <tr>
            <th>Debtor</th>
            <th>Phone</th>
            <th>Transaction ID</th>
            <th>Amount Owed (Ksh)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((d) => {
            let formattedNumber = "-";
            if (d.debtorNumber) {
              const phoneNumber = parsePhoneNumberFromString(
                d.debtorNumber,
                "KE"
              );
              formattedNumber =
                phoneNumber?.formatInternational() || d.debtorNumber;
            }

            return (
              <tr key={d.id}>
                <td>{d.debtorName || "-"}</td>
                <td>
                  {d.debtorNumber ? (
                    <a href={`tel:${formattedNumber}`}>{d.debtorNumber}</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{d.transactionId}</td>
                <td>{d.amountOwed.toFixed(2)}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
