// src/components/DebtsList.jsx
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import "../styles/DebtsList.css";
import { timeAgo } from "../utils/utils";
import { getDebtsStatistics } from "../utils/balance";
import { join } from "../db";
Modal.setAppElement("#root"); // accessibility

export default function DebtsList({ debts, onUpdateDebt }) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tsds, setTsDs] = useState([]);
  const ds = getDebtsStatistics(debts);
  ds;
  useEffect(() => {
    const getTsds = async () => {
      let j = await join({
        stores: ["transactions", "debts"],
        column: "transactionId",
      });
      setTsDs(j);
    };
    getTsds();
  }, []);
  tsds;
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

    if (!paymentMethod) {
      toast.error(
        "Please indicate the payment method used to make this transaction!"
      );
      return;
    }

    let updated = {
      ...selectedDebt,
      amountOwed: selectedDebt.amountOwed - amount,
    };
    if (!updated.history) {
      updated.history = [];
    }
    updated.history.push({
      deposit: amount,
      balance: selectedDebt.amountOwed - amount,
      method: paymentMethod,
      date: Date.now(),
    });

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
              <strong>Amount Billed:</strong> {selectedDebt?.amountBilled}
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
                {/* Payment Method */}
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">-- Select Payment Method --</option>
                  <option value="cash">Cash</option>
                  <option value="MP-0745****15">M-Pesa 0745****15</option>
                  <option value="PB-247247-Acc-0745****15">
                    Paybill PB-247247 Acc 0745****15
                  </option>
                  <option value="other">Other</option>
                </select>
                <button onClick={handleUpdate}>Update</button>
              </div>
            )}
            {/* ===== HISTORY SECTION ===== */}
            {selectedDebt.history?.length > 0 && (
              <div className="debt-history" style={{ marginTop: "20px" }}>
                <h3>History</h3>
                {selectedDebt.history.map((h, index) => (
                  <p key={index}>
                    {index + 1}. Paid Ksh <strong>{h.deposit}</strong> via{" "}
                    {h.method} on{" "}
                    {new Date(h.date).toLocaleDateString() || "date"}{" "}
                    {new Date(h.date).toLocaleTimeString() || "date2"} — balance{" "}
                    <strong>{h.balance}</strong>
                  </p>
                ))}
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
