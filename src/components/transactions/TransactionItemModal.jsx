import Modal from "react-modal";
import { useMemo, useEffect, useState } from "react";
import { getDebt } from "../../db";
import { isFullyPaid } from "../../utils/utils"; // ✅ optional helper if available

Modal.setAppElement("#root");

export default function TransactionItemModal({
  transaction,
  isOpen,
  setIsOpen,
}) {
  const [assDebt, setAssDebt] = useState(null);

  const {
    id = "",
    description = "Unnamed transaction",
    type = "expense",
    amount = 0,
    deposit = 0,
    paymentMethod = "N/A",
    debtorName,
    debtorNumber,
  } = transaction || {};

  // 🧠 Fetch only when unpaid or partial
  useEffect(() => {
    if (!isOpen || isFullyPaid(transaction)) return;
    const fetchDebt = async () => {
      const d = await getDebt(id);
      setAssDebt(d || null);
    };
    fetchDebt();
  }, [isOpen, transaction, id]);

  // 🧮 History + Derived Data
  const history = useMemo(() => assDebt?.history || [], [assDebt]);

  const latestHistory = useMemo(() => history?.at(-1) || null, [history]);
  let totalPaid = useMemo(() => {
    if (!history?.length) return deposit ?? 0;
    return history?.reduce((sum, h) => sum + (h?.deposit ?? 0), 0);
  }, [history, deposit]);
  if (!totalPaid || totalPaid == 0) totalPaid = amount;

  const latestDeposit = latestHistory?.deposit ?? deposit ?? 0;
  const latestMethod = latestHistory?.method ?? paymentMethod ?? "N/A";
  const balance = Math.max(amount - totalPaid, 0);

  const cleared = isFullyPaid(transaction) || balance <= 0;

  if (isOpen) {
    console.log("history :>> ", history);
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => setIsOpen(false)}
      className="transaction-modal"
      overlayClassName="modal-overlay"
      closeTimeoutMS={300}
    >
      <div className="modal-content">
        <h2>Transaction Details</h2>

        <p>
          This is a <b>{description}</b>{" "}
          {type === "income" ? "income" : "expense"}.
        </p>

        <p>
          Amount Billed: <b>Ksh {amount.toLocaleString()}</b>
        </p>

        <p>
          Total Paid: <b>Ksh {amount - balance}</b>
        </p>

        {cleared ? (
          <p className="cleared-status">
            <b>Cleared ✅</b>
          </p>
        ) : (
          <p>
            Balance: <b>Ksh {balance.toLocaleString()}</b>
          </p>
        )}

        {!cleared && (
          <p style={{ fontSize: "0.75rem", fontStyle: "italic" }}>
            Latest Payment: <b>Ksh {latestDeposit.toLocaleString()}</b> via{" "}
            <b>{latestMethod}</b>
          </p>
        )}

        {debtorName && (
          <p>
            {type === "expense" ? "Trader" : "Customer"}: <b>{debtorName}</b> (
            {debtorNumber || "N/A"})
          </p>
        )}

        <button className="close-btn" onClick={() => setIsOpen(false)}>
          Close
        </button>
      </div>
    </Modal>
  );
}
