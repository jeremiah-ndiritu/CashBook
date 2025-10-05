// ✅ 1️⃣ Get total income for a specific account
export function getIncomeTotalsIn(
  account = "cash",
  { debts = [], transactions = [] } = {}
) {
  let total = 0;

  // From debts (income type only)
  for (const d of debts) {
    if (d.type === "income" && Array.isArray(d.history)) {
      for (const h of d.history) {
        if (h.method?.toLowerCase() === account.toLowerCase()) {
          total += Number(h.deposit || 0);
        }
      }
    }
  }

  // From transactions (paid or partial income)
  transactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      if (
        t.paymentStatus === "paid" &&
        t.paymentMethod?.toLowerCase() === account.toLowerCase()
      ) {
        total += Number(t.amount || 0);
      } else if (
        t.paymentStatus === "partial" &&
        t.paymentMethod?.toLowerCase() === account.toLowerCase()
      ) {
        total += Number(t.deposit || 0);
      }
    });

  return total;
}

// ✅ 2️⃣ Get total income for all accounts
export function getIncomeTotals(debts = [], transactions = []) {
  const accounts = [
    "cash",
    "mp-0745****15",
    "pb-247247-acc-0745****15",
    "other",
  ];

  const totals = Object.fromEntries(
    accounts.map((acc) => [
      acc,
      getIncomeTotalsIn(acc, { debts, transactions }),
    ])
  );

  // Add grand total
  // totals.total = Object.values(totals).reduce((a, b) => a + b, 0);

  return totals;
}
