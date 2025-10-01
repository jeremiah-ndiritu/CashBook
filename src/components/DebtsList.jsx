// src/components/DebtsList.jsx
import { useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "../styles/DebtsList.css";
import { timeAgo } from "../utils/utils";

Modal.setAppElement("#root"); // accessibility

export default function DebtsList({ debts, onUpdateDebt }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [newAmount, setNewAmount] = useState("");

  if (!debts || debts.length === 0) {
    return <p className="no-debts">No debts recorded yet.</p>;
  }

  const handleOpen = (debt) => {
    setSelectedDebt(debt);
    setNewAmount(""); // reset input each open
  };

  const handleClose = () => {
    setSelectedDebt(null);
  };

  const handleUpdate = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    if (amount > selectedDebt.amountOwed) {
      toast.error("Deposit cannot exceed amount owed!");
      return;
    }

    const updated = {
      ...selectedDebt,
      amountOwed: selectedDebt.amountOwed - amount,
    };

    if (onUpdateDebt) {
      onUpdateDebt(updated);
    } else {
      toast.warn("Debt was not altered!");
    }

    handleClose();
  };

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
            if (!d) return null;

            const debtorName = d?.debtorName || "-";
            const debtorNumber = d?.debtorNumber || "-";
            const transactionId = d?.transactionId || "-";
            const amountOwed = d?.amountOwed
              ? d?.amountOwed.toFixed(2)
              : "0.00";
            const date = d.date
              ? new Date(d.date).toLocaleDateString()
              : new Date().toLocaleDateString();

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
              <tr
                key={d?.transactionId + Math.random() || Math.random()}
                onClick={() => handleOpen(d)}
                className="debt-row"
              >
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
                <td style={{ display: "flex", flexDirection: "column" }}>
                  <span>{date}</span>
                  <span style={{ fill: "gray", fontSize: "0.75rem" }}>
                    {timeAgo(d.date)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal */}
      <Modal
        isOpen={!!selectedDebt}
        onRequestClose={handleClose}
        className="debt-modal"
        overlayClassName="debt-overlay"
      >
        {selectedDebt && (
          <div className="debt-modal-content">
            <h2>Debt Details</h2>
            <p>
              <strong>Debtor:</strong> {selectedDebt.debtorName}
            </p>
            <p>
              <strong>Phone:</strong> {selectedDebt.debtorNumber}
            </p>
            <p>
              <strong>Transaction ID:</strong> {selectedDebt.transactionId}
            </p>
            <p>
              <strong>Amount Owed:</strong>{" "}
              {selectedDebt.amountOwed == 0
                ? "cleared"
                : selectedDebt.amountOwed?.toFixed(2)}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedDebt.date).toLocaleDateString()}
            </p>

            {selectedDebt.amountOwed > 0 && (
              <div className="debt-update">
                <label>Deposit to reduce debt:</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
                <button onClick={handleUpdate}>Update</button>
              </div>
            )}

            <button className="close-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
