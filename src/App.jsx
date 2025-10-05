// src/App.jsx
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionForm from "./components/transactions/TransactionForm";
import BalanceSummary from "./components/BalanceSummary/BalanceSummary";
import ExportPDF from "./components/ExportPDF";
import {
  addTransaction,
  getTransactions,
  updateDebtInDB,
  getDebts,
} from "./db";
import InstallButton from "./components/InstallButton";

import "./App.css"; // import our custom css
import UpdateButton from "./components/UpdateButton";
import TransactionListSection from "./components/transactions/TransactionListSection";
import DebtsSection from "./components/debts/DebtsSection";
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
  const [refreshTsxs, setRefreshTsxs] = useState(false);
  const [refreshDebts, setRefreshDebts] = useState(false);

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
    if (debt) {
      setRefreshDebts(!refreshDebts);
      setDebts((prev) => [debt, ...prev]);
    }

    setRefreshTsxs(!refreshTsxs);
    setTransactions((prev) => [newTx, ...prev]);
  };
  const handleUpdateDebt = async (updatedDebt) => {
    try {
      let r = await updateDebtInDB(updatedDebt); // custom helper
      if (r) {
        setDebts((prevDebts) =>
          prevDebts.map((d) =>
            d?.transactionId === updatedDebt.transactionId ? updatedDebt : d
          )
        );
        setRefreshDebts(!refreshDebts);
        toast.success(`Debt ${r?.transactionId || r?.id}updated successfully!`);
      }
    } catch (err) {
      toast.error("Failed to update debt!");
      console.log("failed to update debt", err);
    }
  };
  return (
    <div className="app-container">
      <UpdateButton />
      <h1>Cashbook 📒 ({todayKey})</h1>
      <InstallButton />
      <BalanceSummary transactions={transactions} debts={debts} />
      <TransactionForm onAdd={handleAddTransaction} />

      <TransactionListSection refresh={refreshTsxs} />
      <DebtsSection onUpdateDebt={handleUpdateDebt} refresh={refreshDebts} />

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
