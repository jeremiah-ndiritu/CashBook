// src/components/BalanceSummary.jsx
import { useMemo, useState } from "react";
import Modal from "react-modal";
import "./BalanceSummary.css";
import { getLocalDateKey } from "../../utils/utils";
import { getTotals } from "../../utils/totals";
import { getExpenseTotals } from "../../utils/expenses";
import { getIncomeTotals } from "../../utils/income";
import {
  getDebtsStatistics,
  getTransactionsStatistics,
} from "../../utils/balance";
import IncomeModal from "./IncomeModal";
import ExpensesModal from "./ExpensesModal";
import DebtsModal from "./DebtsModal";
import BalanceModal from "./BalanceModal";
Modal.setAppElement("#root");

export default function BalanceSummary({ transactions, debts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  // ✅ Filter today's transactions once
  const todayKey = getLocalDateKey(new Date());
  const todayTransactions = useMemo(
    () => transactions.filter((t) => t.dayKey === todayKey),
    [transactions, todayKey]
  );

  // ✅ Compute only latest unique debts that match today's transactions
  const todayDebts = useMemo(() => {
    if (!debts?.length || !todayTransactions?.length) return [];

    const latestDebts = Object.values(
      debts.reduce((acc, d) => {
        acc[d.transactionId] = d; // overwrite keeps latest per transaction
        return acc;
      }, {})
    );

    return latestDebts.filter((d) =>
      todayTransactions.some((t) => String(t.id) === String(d.transactionId))
    );
  }, [debts, todayTransactions]);

  // ✅ Compute stats only when input changes
  const ts = useMemo(
    () => getTransactionsStatistics(todayTransactions),
    [todayTransactions]
  );
  const ds = useMemo(() => getDebtsStatistics(todayDebts), [todayDebts]);
  const totals = getTotals(todayDebts, todayTransactions);
  const expenseTotals = getExpenseTotals(debts, transactions);
  const incomeTotals = getIncomeTotals(debts, transactions);
  console.log("totals :>> ", totals);
  console.log("incomeTotals :>> ", incomeTotals);

  let totalIncome = Object.values(totals).reduce((acc, arr) => acc + arr, 0);
  let actualBalance = totalIncome - ts.paidExpense;
  // 🔘 Modal logic remains same
  const handleOpen = (type) => {
    setModalType(type);
    setIsOpen(true);
  };

  const methodIcons = {
    mpesa: "📱",
    cash: "💵",
    paybill: "🏦",
    bank: "🏛️",
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "income":
        return (
          <IncomeModal
            totals={totals}
            incomeTotals={incomeTotals}
            ts={ts}
            ds={ds}
            methodIcons={methodIcons}
          />
        );
      case "expenses":
        return <ExpensesModal ts={ts} transactions={transactions} />;
      case "debts":
        return <DebtsModal ts={ts} ds={ds} />;
      case "balance":
        return (
          <BalanceModal ts={ts} totals={totals} expenseTotals={expenseTotals} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="balance-summary-grid">
        <div className="balance-card" onClick={() => handleOpen("income")}>
          <h4>Total Income Today</h4>
          <p>Ksh {(ts.paidIncome + ts.incomeDeposits).toFixed(2)}</p>
        </div>

        <div className="balance-card" onClick={() => handleOpen("debts")}>
          <h4>Total Debts Today</h4>
          <p style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
            <span>(Out) - {ds.totalOutgoingDebts}</span>
            <span>(In) + {Math.abs(ds.totalIncomingDebts.toFixed(2))}</span>
          </p>
        </div>

        <div className="balance-card" onClick={() => handleOpen("expenses")}>
          <h4>Total Expenses Today</h4>
          <p>Ksh {(ts.paidExpense + ts.expenseDeposits).toFixed(2)}</p>
        </div>

        <div
          className={`balance-card ${
            ts.realBalance < 0 ? "balance-negative" : ""
          }`}
          onClick={() => handleOpen("balance")}
        >
          <h4>Current Balance</h4>
          <p>Ksh {actualBalance.toFixed(2)}</p>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="transaction-modal"
        overlayClassName="modal-overlay"
        closeTimeoutMS={300}
      >
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          ✖ Close
        </button>
        <div className="modal-body">{renderModalContent()}</div>
      </Modal>
    </>
  );
}
