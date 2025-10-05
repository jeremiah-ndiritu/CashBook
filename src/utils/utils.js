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
    debt: {
      transactionId: t?.transactionId,
      debtorName: t?.debtorName,
      debtorNumber: t?.debtorNumber,
      amountBilled: t?.amount,
      amountOwed: t?.amount - t?.deposit,
      status: t?.paymentStatus,
      type: t?.type,
      clearedAt: "",
      date: t?.date,
      history: t.debt ? [...t.debt.history] : [],
    },
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
    history: d?.history ? [...d.history] : [],
  };
}

export function normalizeDebtHistoryEntry(dh) {
  return {
    deposit: dh?.deposit || 0,
    method: String(dh?.method) || "give",
    balance: dh?.balance,
    date: dh?.date || Date.now(),
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

export const isFullyPaid = (transaction = {}) => {
  // Defensive coding: handle undefined/null gracefully
  const status = transaction.paymentStatus?.toLowerCase?.();
  return status === "paid" || status === "cleared";
};

export function getBalanceByMethodFromDebts(debts) {
  const balances = {};

  debts.forEach((debt) => {
    debt.history?.forEach((entry) => {
      const method = entry.method?.toLowerCase() || "other";
      const deposit = Number(entry.deposit) || 0;
      balances[method] = (balances[method] || 0) + deposit;
    });
  });

  return balances;
}
export function getTotalPaidDeposits(debts) {
  debts = debts.filter((d) => d);
  let total = 0;

  for (const d of debts) {
    for (const h of d.history) {
      total += h.deposit;
    }
  }
  return total;
}

export function filterDebts(debts = [], transactions = []) {
  let r = [];
  for (const d of debts) {
    for (const t of transactions) {
      if (t.id == d.transactionId) {
        r.push(d);
      }
    }
  }
  return r;
}

export function mapDay(day = 0) {
  if (day == 0) return "Sunday";
  if (day == 1) return "Monday";
  if (day == 2) return "Tuesday";
  if (day == 3) return "Wednesday";
  if (day == 4) return "Thursday";
  if (day == 5) return "Friday";
  if (day == 6) return "Saturday";
}
export function makeReportTitle(mode = "full", type = "today") {
  let prefix = mode == "full" ? "Cash Book Report" : "Cash Summary Report";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);
  switch (type) {
    case "today":
      return prefix + " – Today";
    case "yesterday":
      return (
        prefix +
        mapDay(yesterday.getDay()) +
        yesterdayKey.split("-").reverse().join("/")
      );
    case "last7":
      return prefix + " – Last 7 Days";
    case "month":
      return prefix + " – This Month";
    case "all":
      return prefix + " – All Records";
    default:
      return "Cash Book Report";
  }
}
export const filterTransactions = (transactions, reportType = "today") => {
  const now = new Date();
  const todayKey = getLocalDateKey(now);

  if (reportType === "today") {
    return transactions.filter((t) => t.dayKey === todayKey);
  }
  if (reportType === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);
    return transactions.filter((t) => t.dayKey === yesterdayKey);
  }
  if (reportType === "last7") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    return transactions.filter((t) => new Date(t.date) >= sevenDaysAgo);
  }
  if (reportType === "month") {
    const month = now.getMonth();
    const year = now.getFullYear();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }
  if (reportType === "all") {
    return transactions;
  }
  return [];
};
