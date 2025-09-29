// src/components/TransactionForm.jsx
import { useState } from "react";
import { toast } from "react-toastify"; // assuming you installed react-toastify
import "react-toastify/dist/ReactToastify.css";
import "../styles/TransactionForm.css";

export default function TransactionForm({ onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");

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

    const transaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };

    onAdd(transaction);

    setDescription("");
    setAmount("");
    setType("");
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
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">-- Select Type --</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
