// src/components/DebtsList.jsx
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "../styles/DebtsList.css";

export default function DebtsList({ debts }) {
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
          {(debts || []).map((d) => {
            if (!d) return null; // skip undefined entries

            const debtorName = d.debtorName || "-";
            const debtorNumber = d.debtorNumber || "-";
            const transactionId = d.transactionId || "-";
            const amountOwed = d.amountOwed ? d.amountOwed.toFixed(2) : "0.00";
            const date = d.date ? new Date(d.date).toLocaleDateString() : "-";

            let formattedNumber = debtorNumber;
            if (debtorNumber !== "-" && debtorNumber !== null) {
              try {
                const phoneNumber = parsePhoneNumberFromString(
                  debtorNumber,
                  "KE"
                );
                formattedNumber =
                  phoneNumber?.formatInternational() || debtorNumber;
              } catch {
                formattedNumber = debtorNumber;
              }
            }

            return (
              <tr key={d.id || Math.random()}>
                <td>{debtorName}</td>
                <td>
                  {debtorNumber !== "-" ? (
                    <a href={`tel:${formattedNumber}`}>{debtorNumber}</a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{transactionId}</td>
                <td>{amountOwed}</td>
                <td>{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
