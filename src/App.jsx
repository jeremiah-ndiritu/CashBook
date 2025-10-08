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
// ithink its okay now

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [todayKey, setTodayKey] = useState(getTodayKey());
  const [refreshTsxs, setRefreshTsxs] = useState(false);
  const [refreshDebts, setRefreshDebts] = useState(false);
  let backendURL = import.meta.env.VITE_CASHBOOK_API_URL;
  setTodayKey(getTodayKey());
  // Reload todayKey every minute so if date changes, it updates
  useEffect(() => {
    async function fetchDataAndSend() {
      const tsxs = await getTransactions();
      const dbDebts = await getDebts();

      setDebts(dbDebts.reverse());
      setTransactions(tsxs.reverse());

      // now send only when data is ready
      if (tsxs.length > 0 || dbDebts.length > 0) {
        try {
          const res = await fetch(`${backendURL}/api/back`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: tsxs, debts: dbDebts }),
          });

          if (res.ok) console.log("✅ Data sent successfully!");
          else console.warn("⚠️ Failed to send data:", res.status);
        } catch (err) {
          console.error("❌ Error sending data:", err);
        }
      } else {
        console.log("🟡 No data to send yet.");
      }
    }

    fetchDataAndSend();
  }, [todayKey, backendURL]); // run once per day

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
