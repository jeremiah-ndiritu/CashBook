// src/components/BalanceSummary.jsx
import { useState } from "react";
import Modal from "react-modal";
import "../styles/BalanceSummary.css";
import { getLocalDateKey } from "../utils/utils";
import {
  getDebtsStatistics,
  getTransactionsStatistics,
} from "../utils/balance";
import DebtsSummary from "./DebtsSummary";

Modal.setAppElement("#root");

export default function BalanceSummary({ transactions, debts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const now = new Date();
  const todayKey = getLocalDateKey(now);
  transactions = transactions.filter((t) => t.dayKey === todayKey);

  const ts = getTransactionsStatistics(transactions);
  const ds = getDebtsStatistics(debts);

  const handleOpen = (type) => {
    setModalType(type);
    setIsOpen(true);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "income":
        return (
          <>
            <h2>💰 Total Income Today</h2>
            {ts.realBalance > 0 && (
              <p>Here’s the breakdown of where the money flowed in:</p>
            )}
            <ul>
              {Object.entries(ts.accountBalances).map(([method, balance]) =>
                balance > 0 ? (
                  <li key={method}>
                    {method}: <b>Ksh {balance.toFixed(2)}</b>
                  </li>
                ) : null
              )}
            </ul>
            {ts.realBalance > 0 ? (
              <p>
                🔥 In total, you pulled in{" "}
                <b>Ksh {(ts.paidIncome + ts.incomeDeposits).toFixed(2)}</b>.
                Keep working! 🚀 May God bless the work of your hands
              </p>
            ) : (
              <p>
                Today you haven't gotten anything. Take heart and keep pressing
                on
              </p>
            )}
          </>
        );

      case "debts":
        return (
          <>
            <h2>📉 Total Debts Today</h2>
            <p>
              🔻 Outgoing debts: <b>Ksh {ts.unpaidExpense}</b> (you owe this
              much).
              <br />
              🔺 Incoming debts: <b>Ksh {Math.abs(ts.unpaidIncome)}</b> (others
              owe you this much).
            </p>
            <p>Make sure you pay the debts you owe to others. 🧾</p>
            {}
            {<DebtsSummary sDs={ds.unclearedIncomingDebts} type={"income"} />}
            {<DebtsSummary sDs={ds.unclearedOutgoingDebts} type={"expense"} />}
          </>
        );

      case "expenses":
        return (
          <>
            <h2>💸 Total Expenses Today</h2>
            <p>
              You’ve spent{" "}
              <b>Ksh {(ts.paidExpense + ts.expenseDeposits).toFixed(2)}</b>{" "}
              today. Every shilling’s accounted for — keep flexing that
              budgeting. 📊
            </p>

            <h3 style={{ marginTop: "1rem" }}>📝 Expense Breakdown</h3>
            <ol style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
              {transactions
                .filter((t) => t.type === "expense")
                .map((t) => (
                  <li key={t.id} style={{ marginBottom: "0.6rem" }}>
                    {t.description} — <b>Ksh {t.amount.toFixed(2)}</b>{" "}
                    {t.paymentStatus === "paid" ? (
                      <span style={{ color: "green" }}>(Paid in full)</span>
                    ) : (
                      <span style={{ color: "orange" }}>
                        (Partial {t.deposit || 0} / Balance{" "}
                        {t.amount - (t.deposit || 0)})
                      </span>
                    )}
                  </li>
                ))}
            </ol>
            <p>
              You still need to pay Ksh {ts.unpaidExpense} to whoever you owe a
              debt. So you'll have spent a total of Ksh{" "}
              {ts.paidExpense + ts.unpaidExpense}
            </p>
          </>
        );

      case "balance":
        return (
          <>
            <h2>📊 Current Balance</h2>
            <p>
              {ts.realBalance == 0 && (
                <>
                  😎No problem. You have no Ksh 0.00 left. Keep pushing. Never
                  lose hope, God will make a way
                </>
              )}
              {ts.realBalance > 0 ? (
                <>
                  ✅ You’re up with <b>Ksh {ts.realBalance.toFixed(2)}</b> left.
                  Chill and shine ✨
                </>
              ) : (
                <>
                  ⚠ Red alert… you’re down by{" "}
                  <b>Ksh {Math.abs(ts.realBalance).toFixed(2)}</b>. Maybe slow
                  down the spending 👀
                </>
              )}
            </p>

            {ts.realBalance > 0 && (
              <>
                {
                  <>
                    <h3 style={{ marginTop: "1.2rem" }}>
                      💼 Breakdown per account
                    </h3>
                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
                      {Object.entries(ts.accountBalances).map(
                        ([method, balance]) => (
                          <li key={method}>
                            {method}: <b>Ksh {balance.toFixed(2)}</b>
                          </li>
                        )
                      )}
                    </ul>{" "}
                  </>
                }
              </>
            )}
          </>
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
            <span>(Out) - {ts.unpaidExpense}</span>
            <span>(In) + {Math.abs(ts.unpaidIncome)}</span>
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
          <p>Ksh {ts.realBalance.toFixed(2)}</p>
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
