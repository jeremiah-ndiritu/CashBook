import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TransactionForm from "../components/transactions/TransactionForm";
import BalanceSummary from "../components/BalanceSummary/BalanceSummary";
import ExportPDF from "../components/ExportPDF";
import {
  addTransaction,
  getTransactions,
  updateDebtInDB,
  getDebts,
} from "../db";
import InstallButton from "../components/InstallButton";
import UpdateButton from "../components/UpdateButton";
import TransactionListSection from "../components/transactions/TransactionListSection";
import DebtsSection from "../components/debts/DebtsSection";
import "./Workspace.css";

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
  const backendURL = import.meta.env.VITE_CASHBOOK_API_URL;
  const hasSentRef = useRef(false); // track if initial send is done

  // Update todayKey every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayKey(getTodayKey());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Load IndexedDB data once per day (or per todayKey)
  useEffect(() => {
    let isMounted = true;

    async function fetchDataAndSend() {
      const tsxs = await getTransactions();
      const dbDebts = await getDebts();

      if (!isMounted) return;

      setTransactions(tsxs.reverse());
      setDebts(dbDebts.reverse());

      // Only send once
      if (!hasSentRef.current && (tsxs.length > 0 || dbDebts.length > 0)) {
        try {
          const res = await fetch(`${backendURL}/api/back`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: tsxs, debts: dbDebts }),
          });
          if (res.ok) console.log("✅ Initial data sent successfully!");
          else console.warn("⚠️ Failed to send data:", res.status);
        } catch (err) {
          console.error("❌ Error sending data:", err);
        }
        hasSentRef.current = true;
      }
    }

    fetchDataAndSend();

    return () => {
      isMounted = false; // cleanup
    };
  }, [todayKey, backendURL]);

  const handleAddTransaction = async (transaction) => {
    const newTx = { ...transaction, dayKey: todayKey };
    const debt = await addTransaction(newTx);
    if (debt) {
      setRefreshDebts((prev) => !prev);
      setDebts((prev) => [debt, ...prev]);
    }
    setRefreshTsxs((prev) => !prev);
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateDebt = async (updatedDebt) => {
    try {
      const r = await updateDebtInDB(updatedDebt);
      if (r) {
        setDebts((prevDebts) =>
          prevDebts.map((d) =>
            d?.transactionId === updatedDebt.transactionId ? updatedDebt : d
          )
        );
        setRefreshDebts((prev) => !prev);
        toast.success(
          `Debt ${r?.transactionId || r?.id} updated successfully!`
        );
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
        autoClose={3000}
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
