// src/db.js
import { openDB } from "idb";
import { normalizeDebt, normalizeTransaction } from "./utils/utils";
import { refillGas, updateCylinderQuantity } from "./utils/cylinders";
import { toast } from "react-toastify";

export const DB_NAME = "cashbook-db";
export const STORE_TRANSACTIONS = "transactions";
export const STORE_DEBTS = "debts";
export const STORE_CYLINDERS = "cylinders";

export const DB_VERSION = 3;

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

      // ✅ Cylinders Store
      if (!db.objectStoreNames.contains(STORE_CYLINDERS)) {
        const cylinderStore = db.createObjectStore(STORE_CYLINDERS, {
          keyPath: "id",
          autoIncrement: true,
        });

        // Optional indexes for efficient lookups
        cylinderStore.createIndex("name", "name", { unique: false });
        cylinderStore.createIndex("capacity", "capacity", { unique: false });
      }
    },
  });
}

// Transactions
export async function addTransaction(transaction) {
  const db = await initDB();
  await db.add(STORE_TRANSACTIONS, transaction);

  //GAS actions: buy, refill or sell
  let isGas = transaction.txnProduct == "gas";
  if (isGas && transaction.gasAction == "buy") {
    updateCylinderQuantity(transaction.txnGasId, transaction.quantity);
  }
  if (isGas && transaction.gasAction == "sell") {
    updateCylinderQuantity(transaction.txnGasId, -transaction.quantity);
  }
  if (isGas && transaction.gasAction == "refill") {
    const res = await refillGas(transaction.txnGasId, transaction.quantity);
    if (res) {
      toast.success("Gas refilled successfully!" + res.id);
    } else {
      toast.error("Error updating cylinders!");
    }
  }

  // If credit is partial or unpaid, save debt info
  if (transaction.paymentStatus && transaction.paymentStatus !== "paid") {
    const debt = normalizeDebt({
      transactionId: transaction.id,
      debtorName: transaction.debtorName || null,
      debtorNumber: transaction.debtorNumber || null,
      type: transaction.type,
      paymentMethod: transaction?.paymentMethod,
      amountBilled: transaction.amount,
      amountOwed:
        transaction.paymentStatus == "partial"
          ? transaction.amount - transaction.deposit
          : transaction.amount,
      date: transaction.date,
      history: [
        {
          deposit: transaction?.deposit || 0,
          method: transaction.paymentMethod,
          balance: transaction?.amount - transaction?.deposit,
          date: transaction?.date || new Date().toISOString(),
        },
      ],
    });
    await addDebt(debt);
    return debt || null;
  }
}

export async function getTransactions() {
  const db = await initDB();
  return (await db.getAll(STORE_TRANSACTIONS)).map(normalizeTransaction);
}

export async function getTransaction(transactionId) {
  if (!transactionId) {
    console.warn("getTransaction() called without transactionId");
    return null;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_TRANSACTIONS, "readonly");
  const store = tx.objectStore(STORE_TRANSACTIONS);

  let txn = null;
  try {
    // ✅ since id is the keyPath
    txn = await store.get(Number(transactionId));
    if (!txn) txn = await store.get(String(transactionId));
  } catch (err) {
    console.error("getTransaction(): failed to fetch by id", err);
  }
  return txn ? normalizeTransaction(txn) : null;
}

export async function getDebt(transactionId) {
  if (!transactionId) {
    console.warn("getDebt() called without transactionId");
    return null;
  }

  const db = await initDB();
  const tx = db.transaction(STORE_DEBTS, "readonly");
  const store = tx.objectStore(STORE_DEBTS);

  // ✅ Use index if available
  let debt = null;
  try {
    const index = store.index("transactionId");
    debt = await index.get(Number(transactionId));
    if (!debt) debt = await index.get(String(transactionId));
  } catch (err) {
    console.error("getDebt(): Failed to use index 'transactionId'", err);
  }
  return debt ? normalizeDebt(debt) : null;
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
  if (!updatedDebt?.transactionId) {
    console.warn("updateDebtInDB() called without transactionId");
    return null;
  }

  const db = await openDB(DB_NAME, DB_VERSION);
  const tx = db.transaction([STORE_DEBTS, STORE_TRANSACTIONS], "readwrite");
  const debtStore = tx.objectStore(STORE_DEBTS);
  const txStore = tx.objectStore(STORE_TRANSACTIONS);

  // ✅ Fetch existing debt via index
  const debtIndex = debtStore.index("transactionId");
  const existingDebt = await debtIndex.get(updatedDebt.transactionId);
  if (!existingDebt) {
    console.warn(
      "No existing debt found for transactionId:",
      updatedDebt.transactionId
    );
    await tx.done;
    return null;
  }

  // ✅ Fetch associated transaction
  const transaction =
    (await txStore.get(Number(updatedDebt.transactionId))) ||
    (await txStore.get(updatedDebt.transactionId));
  if (!transaction) {
    console.warn("No transaction found for ID:", updatedDebt.transactionId);
    await tx.done;
    return null;
  }

  // ✅ Update the deposit properly
  let totalDeposit = (updatedDebt?.history || []).reduce(
    (acc, h) => acc + Number(h?.deposit || 0),
    0
  );

  const updatedTransaction = { ...transaction, deposit: totalDeposit };

  // ✅ Keep same IDs for consistency
  updatedDebt.id = existingDebt.id;

  // ✅ Save both back
  await debtStore.put(updatedDebt);
  await txStore.put(updatedTransaction);

  await tx.done;

  return normalizeDebt(updatedDebt);
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
export async function join({
  stores = ["debts", "transactions"],
  column = "transactionId",
} = {}) {
  const db = await initDB();
  const allData = {};

  // Load all stores
  for (const storeName of stores) {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const items = await store.getAll();
    allData[storeName] = items;
  }

  // Merge by the join column
  const mergedMap = new Map();

  for (const storeName of stores) {
    for (const item of allData[storeName]) {
      const key = item[column];
      if (!key) continue;

      if (!mergedMap.has(key)) mergedMap.set(key, {});
      const existing = mergedMap.get(key);

      // Merge properties, later stores overwrite same keys
      Object.assign(existing, item);
      mergedMap.set(key, existing);
    }
  }

  return Array.from(mergedMap.values());
}

/**
 * Get all transactions with their associated debts (flat merge)
 * Returns an array of objects
 */
export async function getTsxsAndDebts() {
  const db = await initDB();

  const txs = await db.getAll(STORE_TRANSACTIONS);
  const dts = await db.getAll(STORE_DEBTS);

  if ((!txs || txs.length === 0) && (!dts || dts.length === 0)) return [];

  // Build a quick lookup for debts by transactionId
  const debtMap = new Map();
  for (const d of dts) {
    if (!d.transactionId) continue;
    debtMap.set(d.transactionId, d);
  }

  const result = [];

  for (const t of txs) {
    const td = {
      ...t, // all transaction fields
    };

    // Merge matching debt if it exists
    const matchingDebt = debtMap.get(t.transactionId);
    if (matchingDebt) {
      td.debtorName = matchingDebt.debtorName;
      td.debtorNumber = matchingDebt.debtorNumber;
      td.amountBilled = matchingDebt.amountBilled;
      td.amountOwed = matchingDebt.amountOwed;
      td.debtType = matchingDebt.type; // optional: avoid conflict with t.type
      td.debtStatus = matchingDebt.status;
      td.debtClearedAt = matchingDebt.clearedAt;
      td.debtDate = matchingDebt.date; // original debt date
    }

    result.push(td);
  }

  return result;
}
