// src/App.jsx
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BalanceSummary from "./components/BalanceSummary";
import ExportPDF from "./components/ExportPDF";
import { addTransaction, getTransactions } from "./db";

import "./App.css"; // import our custom css
// Get today's date key (YYYY-MM-DD)
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [todayKey] = useState(getTodayKey());

  useEffect(() => {
    async function fetchData() {
      const stored = await getTransactions();
      // only today’s
      setTransactions(stored.filter((t) => t.dayKey === todayKey));
    }
    fetchData();
  }, [todayKey]);

  const handleAddTransaction = async (transaction) => {
    const newTx = { ...transaction, dayKey: todayKey };
    await addTransaction(newTx);
    setTransactions((prev) => [...prev, newTx]);
  };

  return (
    <div className="app-container">
      <h1>Cashbook 📒 ({todayKey})</h1>
      <BalanceSummary transactions={transactions} />
      <TransactionForm onAdd={handleAddTransaction} />
      <TransactionList transactions={transactions} />
      <ExportPDF transactions={transactions} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
