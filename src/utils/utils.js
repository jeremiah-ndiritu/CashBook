// Helper: get local YYYY-MM-DD
export function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper: get local YYYY-MM-DD-HH-MM-SS
export function getLocalDateTimeKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}-${hh}-${mm}-${ss}`;
}

export function normalizeTransaction(t) {
  return {
    id: t.id || Date.now(),
    dayKey: t.dayKey,
    description: t.description || "",
    amount: t.amount || 0,
    paymentMethod: t.paymentMethod || "N/A",
    type: t.type || "income",
    paymentStatus: t.paymentStatus || "paid", // default if missing
    deposit: t.deposit ?? (t.amount || 0), // fallback to amount
    debtorName: t.debtorName || null,
    debtorNumber: t.debtorNumber || null,
    date: t.date || new Date().toISOString(),
  };
}

export function normalizeDebt(d) {
  return {
    transactionId: d.id || Date.now(),
    debtorName: d.debtorName || "-",
    debtorNumber: d.debtorNumber || "-",
    amountOwed: d.amountOwed || 0,
    type: d.type || "income",
    date: d.date || new Date().toISOString(),
  };
}
