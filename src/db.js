// src/db.js
import { openDB } from "idb";
import { normalizeDebt, normalizeTransaction } from "./utils/utils";
import { toast } from "react-toastify";

const DB_NAME = "cashbook-db";
const STORE_TRANSACTIONS = "transactions";
const STORE_DEBTS = "debts";

const DB_VERSION = 2;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create transactions store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
        db.createObjectStore(STORE_TRANSACTIONS, { keyPath: "id" });
      }

      // Create debts store
      if (!db.objectStoreNames.contains(STORE_DEBTS)) {
        const debtStore = db.createObjectStore(STORE_DEBTS, {
          keyPath: "id",
          autoIncrement: true,
        });
        debtStore.createIndex("transactionId", "transactionId", {
          unique: false,
        });
      }
    },
  });
}

// Transactions
export async function addTransaction(transaction) {
  const db = await initDB();
  await db.add(STORE_TRANSACTIONS, transaction);

  // If credit is partial or unpaid, save debt info
  if (transaction.paymentStatus && transaction.paymentStatus !== "paid") {
    const debt = normalizeDebt({
      transactionId: transaction.id,
      debtorName: transaction.debtorName || null,
      debtorNumber: transaction.debtorNumber || null,
      type: transaction.type,
      amountBilled: transaction.amount,
      amountOwed:
        transaction.credit == "partial"
          ? transaction.amount - transaction.deposit
          : transaction.amount,
      date: transaction.date,
    });
    await addDebt(debt);
    return debt || null;
  }
}

export async function getTransactions() {
  const db = await initDB();
  return (await db.getAll(STORE_TRANSACTIONS)).map(normalizeTransaction);
}

export async function getTransaction(id = Date.now()) {
  const db = await initDB();
  let t = await db.get(STORE_TRANSACTIONS, id);
  return t || {};
}
export async function getDebt(id = Date.now()) {
  const db = await initDB();
  let t = await db.get(STORE_DEBTS, id);
  return t || {};
}
// Debts
export async function addDebt(debt) {
  const db = await initDB();
  await db.add(STORE_DEBTS, debt);
}

export async function getDebts() {
  const db = await initDB();
  return (await db.getAll(STORE_DEBTS)).map(normalizeDebt);
}
export async function updateDebtInDB(updatedDebt) {
  const db = await openDB(DB_NAME, 2);
  const tx = db.transaction(STORE_DEBTS, "readwrite");
  const store = tx.objectStore(STORE_DEBTS);
  const index = store.index("transactionId");

  // Step 1: Look up by transactionId
  const existing = await index.get(updatedDebt?.transactionId);
  console.log("existing :>> ", existing);
  if (!existing) {
    toast.warn("No debt found!");
    console.warn(
      "No debt found with transactionId:",
      updatedDebt.transactionId
    );
    return null; // fail gracefully
  }

  // Step 2: Carry forward the id
  updatedDebt.id = existing.id;

  // Step 3: Save back
  await store.put(updatedDebt);

  await tx.done;
  return normalizeDebt(updatedDebt); // nice to return the fresh object
}
export async function getStoreCount(storeName) {
  const db = await initDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const count = await store.count();
  await tx.done;
  return count;
}
export async function getPage(
  storeName = "transactions",
  page = 1,
  pageSize = 10
) {
  const db = await initDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);

  // get all records
  const all = await store.getAll();

  // newest first
  const reversed = all.reverse();

  // calculate start/end
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return reversed.slice(start, end);
}
