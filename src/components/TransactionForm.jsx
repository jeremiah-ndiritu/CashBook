import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/TransactionForm.css";

export default function TransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [type, setType] = useState("");

  const normalizePayment = (value) => {
    if (!value) return "other";
    const v = value.toLowerCase();
    if (v.includes("mp")) return "mpesa";
    if (v.includes("pb")) return "paybill";
    if (v.includes("cash")) return "cash";
    return "other";
  };

  const handleAdd = () => {
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!type) {
      toast.error("Please select income or expense");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const transaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
      paymentMethod,
      paymentCategory: normalizePayment(paymentMethod),
    };

    onAdd(transaction);

    setDescription("");
    setAmount("");
    setType("");
    setPaymentMethod("");
    toast.success("Transaction added!", { autoClose: 2000 });
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

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="">-- Select Payment Method --</option>
        <option value="Cash">Cash</option>
        <option value="M-Pesa 0745****15">M-Pesa 0745****15</option>
        <option value="Paybill PB-247247 Acc 0745****15">
          Paybill PB-247247 Acc 0745****15
        </option>
        <option value="Other">Other</option>
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">-- Select Type --</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
