// src/components/TransactionForm.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TransactionForm.css";

const starn = (str = "") => {
  switch (str) {
    case "full":
      return "paid";
    case "partial":
      return "partial";
    case "unpaid":
      return "unpaid";
    default:
      return "N/A";
  }
};
export default function TransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [type, setType] = useState("");
  const [credit, setCredit] = useState("");
  const [deposit, setDeposit] = useState("");
  const [debtorName, setDebtorName] = useState("");
  const [debtorNumber, setDebtorNumber] = useState("");

  const handleAdd = () => {
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }
    if (!type) {
      toast.error("Please select income or expense");
      return;
    }
    if (!credit) {
      toast.error("Please select credit status");
      return;
    }
    if (credit == "partial" && !deposit) {
      toast.error("Please enter the deposit amount");
    }
    // If not full payment, at least one debtor field required
    if (credit !== "full" && !debtorName.trim() && !debtorNumber.trim()) {
      toast.error("Enter at least debtor name or number");
      return;
    }

    const transaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      paymentMethod,
      type,
      paymentStatus: starn(credit), // paid | partial | unpaid
      deposit: parseFloat(deposit) || 0,
      debtorName: debtorName.trim() || null,
      debtorNumber: debtorNumber.trim() || null,
      date: new Date().toISOString(),
    };

    onAdd(transaction);

    // Reset
    setDescription("");
    setAmount("");
    setPaymentMethod("");
    setType("");
    setCredit("");
    setDeposit("");
    setDebtorName("");
    setDebtorNumber("");
    toast.success("Transaction added!");
  };

  return (
    <div className="transaction-form">
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
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

      {/* Income / Expense */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">-- Select Type --</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      {/* Credit Status */}
      <select value={credit} onChange={(e) => setCredit(e.target.value)}>
        <option value="">-- Credit Status --</option>
        <option value="full">Full Payment</option>
        <option value="partial">Partial Payment</option>
        <option value="unpaid">Unpaid / Debt</option>
      </select>

      {/* Debtor Info - only show if credit is not full */}
      {credit !== "full" && credit !== "" && (
        <div
          className={`debtor-info-wrapper ${credit !== "full" ? "show" : ""}`}
        >
          <input
            type="number"
            placeholder="Deposit made"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />
          <input
            type="text"
            placeholder="Debtor Name"
            value={debtorName}
            onChange={(e) => setDebtorName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Debtor Number"
            value={debtorNumber}
            onChange={(e) => setDebtorNumber(e.target.value)}
          />
        </div>
      )}

      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
