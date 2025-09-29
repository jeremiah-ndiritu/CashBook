// src/db.js
import { openDB } from "idb";

const DB_NAME = "cashbook-db";
const STORE_NAME = "transactions";

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function addTransaction(transaction) {
  const db = await initDB();
  await db.add(STORE_NAME, transaction);
}

export async function getTransactions() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
