// Get expense total for a specific account
export function getExpenseTotalsIn(
  account,
  { debts = [], transactions = [] } = {}
) {
  let total = 0;

  // From debts
  for (const d of debts) {
    for (const h of d.history || []) {
      if (
        h.method?.toLowerCase() === account.toLowerCase() &&
        d.type == "expense"
      ) {
        total += h.deposit || 0;
      }
    }
  }

  // From transactions
  transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.paymentStatus === "paid" &&
        t.paymentMethod?.toLowerCase() === account.toLowerCase()
    )
    .forEach((t) => {
      total += t.amount || 0;
    });

  return total;
}

// Get expense totals across all acco unts
export function getExpenseTotals(debts = [], transactions = []) {
  const accounts = [
    "cash",
    "mp-0745****15",
    "pb-247247-acc-0745****15",
    "other",
  ];

  return Object.fromEntries(
    accounts.map((acc) => [
      acc,
      getExpenseTotalsIn(acc, { debts, transactions }),
    ])
  );
}
