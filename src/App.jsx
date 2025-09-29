// src/App.jsx
import { useState, useEffect } from "react";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BalanceSummary from "./components/BalanceSummary";
import ExportPDF from "./components/ExportPDF";
import { addTransaction, getTransactions } from "./db";

import "./App.css"; // import our custom css

export default function App() {
  const [transactions, setTransactions] = useState([]);

  // Load transactions from IndexedDB on mount
  useEffect(() => {
    async function fetchData() {
      const stored = await getTransactions();
      setTransactions(stored);
    }
    fetchData();
  }, []);

  const handleAddTransaction = async (transaction) => {
    await addTransaction(transaction);
    setTransactions((prev) => [...prev, transaction]);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Cashbook 📒</h1>
      <BalanceSummary transactions={transactions} />
      <TransactionForm onAdd={handleAddTransaction} />
      <TransactionList transactions={transactions} />
      <ExportPDF transactions={transactions} />
    </div>
  );
}
