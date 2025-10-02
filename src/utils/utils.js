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
    id: t?.id || t?.transactionId || Date.now(),
    dayKey: t?.dayKey,
    description: t?.description || "",
    amount: t?.amount || 0,
    paymentMethod: t?.paymentMethod || "N/A",
    type: t?.type || "income",
    paymentStatus: t?.paymentStatus || "paid", // default if missing
    deposit: t?.deposit ?? (t?.amount || 0), // fallback to amount
    debtorName: t?.debtorName || null,
    debtorNumber: t?.debtorNumber || null,
    date: t?.date || new Date().toISOString(),
  };
}

export function normalizeDebt(d) {
  return {
    transactionId: d.transactionId || Date.now(),
    debtorName: String(d.debtorName) || "-",
    debtorNumber: String(d.debtorNumber) || "-",
    amountBilled: d.amountBilled || 0,
    amountOwed: d.amountOwed || 0,
    type: String(d.type) || "income",
    date: d.date || new Date().toISOString(),
    status: d?.amountOwed == 0 ? "cleared" : "pending",
    clearedAt: d?.clearedAt || "Not cleared",
    history: [
      {
        deposit: d?.amountBilled - d?.amountOwed || 0,
        method: d?.method,
        balance: d?.amountOwed,
        date: d?.date || Date.now(),
      },
    ],
  };
}

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date; // difference in ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  return "just now";
}
