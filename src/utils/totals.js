export function getTotalBalanceIn(
  account = "cash",
  { debts = [], transactions = [] } = {}
) {
  let total = 0;

  // ✅ 1. Go through all debts’ histories and add deposits that match this method
  for (const d of debts) {
    if (!Array.isArray(d.history)) continue; // safety guard
    for (const h of d.history) {
      if (
        String(h.method).toLowerCase() === String(account).toLowerCase() &&
        Number(h.deposit) > 0
      ) {
        total += Number(h.deposit);
      }
    }
  }

  // ✅ 2. Add fully paid transactions that used this method
  const paidTx = transactions.filter(
    (t) =>
      t.paymentStatus === "paid" &&
      String(t.paymentMethod).toLowerCase() === String(account).toLowerCase() &&
      Number(t.amount) > 0 &&
      t.type === "income" // Optional: include only income-type inflows
  );

  for (const t of paidTx) {
    total += Number(t.amount);
  }

  return total;
}
export function getTotals(debts = [], transactions = []) {
  const accounts = [
    "cash",
    "mp-0745****15",
    "pb-247247-acc-0745****15",
    "other",
  ];

  return Object.fromEntries(
    accounts.map((acc) => [
      acc,
      getTotalBalanceIn(acc, { debts, transactions }),
    ])
  );
}
