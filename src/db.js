// src/db.js
import { openDB } from "idb";

const DB_NAME = "cashbook-db";
const STORE_TRANSACTIONS = "transactions";
const STORE_DEBTS = "debts";

export async function initDB() {
  return openDB(DB_NAME, 2, {
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
  if (transaction.credit && transaction.credit !== "full") {
    await addDebt({
      transactionId: transaction.id,
      debtorName: transaction.debtorName || null,
      debtorNumber: transaction.debtorNumber || null,
      amountOwed:
        transaction.credit === "partial"
          ? transaction.amount / 2 // you can adjust how partial is calculated
          : transaction.amount,
      date: transaction.date,
    });
  }
}

export async function getTransactions() {
  const db = await initDB();
  return db.getAll(STORE_TRANSACTIONS);
}

// Debts
export async function addDebt(debt) {
  const db = await initDB();
  await db.add(STORE_DEBTS, debt);
}

export async function getDebts() {
  const db = await initDB();
  return db.getAll(STORE_DEBTS);
}
