// src/App.jsx
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import BalanceSummary from "./components/BalanceSummary";
import ExportPDF from "./components/ExportPDF";
import { addTransaction, getTransactions, getDebts } from "./db";
import InstallButton from "./components/InstallButton";
import DebtsList from "./components/DebtsList";

import "./App.css"; // import our custom css
// Get today's date key (YYYY-MM-DD)
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [todayKey, setTodayKey] = useState(getTodayKey());

  // Reload todayKey every minute so if date changes, it updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newKey = getTodayKey();
      if (newKey !== todayKey) {
        setTodayKey(newKey);
      }
    }, 60_000); // check every 60s
    return () => clearInterval(interval);
  }, [todayKey]);
  useEffect(() => {
    async function fetchData() {
      const tsxs = await getTransactions();
      const debts = await getDebts();
      setDebts(debts.reverse());
      setTransactions(tsxs.reverse());
    }
    fetchData();
  }, [todayKey]);

  const handleAddTransaction = async (transaction) => {
    const newTx = { ...transaction, dayKey: todayKey };
    let debt = await addTransaction(newTx);
    setTransactions((prev) => [newTx, ...prev]);
    setDebts((prev) => [debt, ...prev]);
  };

  return (
    <div className="app-container">
      <h1>Cashbook 📒 ({todayKey})</h1>
      <InstallButton />
      <BalanceSummary transactions={transactions} />
      <TransactionForm onAdd={handleAddTransaction} />
      <TransactionList
        transactions={transactions.filter((t) => t.dayKey === todayKey)}
      />

      <DebtsList debts={debts} />
      <ExportPDF transactions={transactions} debts={debts} />
      <ToastContainer
        position="top-right"
        autoClose={3000} // closes in 3s
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
