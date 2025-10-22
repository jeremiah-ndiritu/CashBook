// src/components/TransactionForm.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TransactionForm.css";
import { getGasTypes } from "../../utils/cylinders";

const starn = (str = "") => {
  switch (str) {
    case "full":
      return "paid";
    case "partial":
      return "partial";
    case "unpaid":
      return "unpaid";
    default:
      return "N/A";
  }
};
export default function TransactionForm({ onAdd }) {
  const [txnProduct, setTxnProduct] = useState("");
  const [gasAction, setGasAction] = useState("");
  const [gasTypes, setGasTypes] = useState([
    { id: "", name: "", capacity: "" },
  ]);
  const [txnGasId, setTxnGasId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [type, setType] = useState("");
  const [credit, setCredit] = useState("");
  const [deposit, setDeposit] = useState("");
  const [debtorName, setDebtorName] = useState("");
  const [debtorNumber, setDebtorNumber] = useState("");

  useEffect(() => {
    const lgts = async () => {
      let ts = await getGasTypes();
      setGasTypes(ts);
    };
    lgts();
  }, []);
  const handleAdd = () => {
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    let q = Number(quantity);
    if ((txnProduct == "gas" && q <= 0) || !quantity) {
      toast.error("Please enter the quantity of Gas!");
      return;
    }
    if (txnProduct == "gas" && !gasAction) {
      toast.error("Please select gas action!");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }
    if (!type) {
      toast.error("Please select income or expense");
      return;
    }
    if (!credit) {
      toast.error("Please select credit status");
      return;
    }
    if (credit == "partial" && !deposit) {
      toast.error("Please enter the deposit amount");
    }
    // If not full payment, at least one debtor field required
    if (credit !== "full" && !debtorName.trim() && !debtorNumber.trim()) {
      toast.error("Enter at least debtor name or number");
      return;
    }

    const transaction = {
      id: Date.now(),
      description,
      txnProduct,
      txnGasId: parseInt(txnGasId),
      gasAction,
      quantity,
      amount: parseFloat(amount),
      paymentMethod,
      type,
      paymentStatus: starn(credit), // paid | partial | unpaid
      deposit: parseFloat(deposit) || 0,
      debtorName: debtorName.trim() || null,
      debtorNumber: debtorNumber.trim() || null,
      date: new Date().toISOString(),
    };

    onAdd(transaction);

    // Reset
    setDescription("");
    setAmount("");
    setGasAction("");
    setQuantity("");
    setTxnProduct("");
    setTxnGasId("");
    setPaymentMethod("");
    setType("");
    setCredit("");
    setDeposit("");
    setDebtorName("");
    setDebtorNumber("");
    toast.success("Transaction added!");
  };

  return (
    <div className="tsxn-frm-wrapper">
      <div className="tsxn-txnProduct">
        <label htmlFor="txnProduct">Choose Product</label>
        <input
          type="radio"
          name="txnProduct"
          value="gas"
          checked={txnProduct === "gas"}
          onChange={(e) => setTxnProduct(e.target.value)}
        />{" "}
        Gas
        <input
          type="radio"
          name="txnProduct"
          value="other"
          checked={txnProduct === "other"}
          onChange={(e) => setTxnProduct(e.target.value)}
        />{" "}
        Other
      </div>

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

        {/* ✅ Show extra fields dynamically if txnProduct === gas */}
        {txnProduct === "gas" && (
          <div className="gas-extra">
            <select
              value={gasAction}
              onChange={(e) => setGasAction(e.target.value)}
            >
              <option value="">-- Select Action --</option>
              <option value="buy">Buy Gas (Cylinders)</option>
              <option value="refill">Refill Gas</option>
              <option value="sell">Sell Gas (Cylinders)</option>
            </select>
            <select
              name="txn-gas"
              onChange={(e) => setTxnGasId(e.target.value)}
            >
              <option value="">--Select Gas--</option>
              {gasTypes.map((gt) => (
                <option value={gt.id}>{gt.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        )}

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">-- Select Payment Method --</option>
          <option value="cash">Cash</option>
          <option value="MP-0745****15">M-Pesa 0745****15</option>
          <option value="PB-247247-Acc-0745****15">
            Paybill PB-247247 Acc 0745****15
          </option>
          <option value="other">Other</option>
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">-- Select Type --</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={credit} onChange={(e) => setCredit(e.target.value)}>
          <option value="">-- Credit Status --</option>
          <option value="full">Full Payment</option>
          <option value="partial">Partial Payment</option>
          <option value="unpaid">Unpaid / Debt</option>
        </select>

        {credit !== "full" && credit !== "" && (
          <div
            className={`debtor-info-wrapper ${credit !== "full" ? "show" : ""}`}
          >
            <input
              type="number"
              placeholder="Deposit made"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
            <input
              type="text"
              placeholder="Debtor Name"
              value={debtorName}
              onChange={(e) => setDebtorName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Debtor Number"
              value={debtorNumber}
              onChange={(e) => setDebtorNumber(e.target.value)}
            />
          </div>
        )}

        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
