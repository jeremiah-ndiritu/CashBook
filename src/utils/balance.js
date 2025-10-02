export function getTransactionsStatistics(transactions) {
  const paidIncome = transactions
    .filter((t) => t.type === "income" && t.paymentStatus === "paid")
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeDeposits = transactions
    .filter((t) => t.type === "income" && t.paymentStatus === "partial")
    .reduce((acc, t) => acc + (t.deposit || 0), 0);

  const unpaidIncome = transactions
    .filter((t) => t.type === "income" && t.paymentStatus !== "paid")
    .reduce((acc, t) => acc + (t.amount - (t.deposit || 0)), 0);

  const paidExpense = transactions
    .filter((t) => t.type === "expense" && t.paymentStatus === "paid")
    .reduce((acc, t) => acc + t.amount, 0);
  const expenseDeposits = transactions
    .filter((t) => t.type === "expense" && t.paymentStatus === "partial")
    .reduce((acc, t) => acc + (t.deposit || 0), 0);

  const unpaidExpense = transactions
    .filter((t) => t.type === "expense" && t.paymentStatus !== "paid")
    .reduce((acc, t) => acc + (t.amount - (t.deposit || 0)), 0);

  // Cash-only snapshot (strictly what’s actually paid now)
  const realBalance =
    paidIncome + incomeDeposits - expenseDeposits - paidExpense;

  // Future-looking: what it would be if everyone paid up & all debts settled
  const expectedBalance =
    paidIncome + incomeDeposits + unpaidIncome - (paidExpense + unpaidExpense);

  // Per-account tracking
  const accountBalances = transactions.reduce((acc, t) => {
    const method = t.paymentMethod || "Unknown";
    if (!acc[method]) acc[method] = 0;

    if (t.type === "income" && t.paymentStatus === "paid") {
      acc[method] += t.amount;
    } else if (t.type === "income" && t.paymentStatus === "partial") {
      acc[method] += t.deposit || 0;
    } else if (t.type === "expense" && t.paymentStatus === "paid") {
      acc[method] -= t.amount;
    } else if (t.type === "expense" && t.paymentStatus === "partial") {
      acc[method] -= t.deposit || 0;
    }
    // (Skipping partial expense deposits for now, since your schema doesn’t use them)
    return acc;
  }, {});

  return {
    paidIncome,
    incomeDeposits,
    expenseDeposits,
    unpaidIncome,
    paidExpense,
    unpaidExpense,
    realBalance,
    expectedBalance,
    accountBalances,
  };
}

export function getDebtsStatistics(debts) {
  // Fully cleared debts
  const clearedDebts = debts
    .filter((d) => d.amountOwed === 0)
    .reduce((acc, d) => acc + (d.amountBilled || 0), 0);

  // Partial payments (amountOwed < amountBilled)
  const partialDebts = debts
    .filter(
      (d) =>
        d.amountOwed > 0 && (d.amountBilled || d.amountOwed) - d.amountOwed > 0
    )
    .reduce(
      (acc, d) => acc + ((d.amountBilled || d.amountOwed) - d.amountOwed),
      0
    );

  // Outstanding debts (still owed)
  const unpaidDebts = debts
    .filter((d) => d.amountOwed > 0)
    .reduce((acc, d) => acc + d.amountOwed, 0);

  // Expected fully collected = cleared + partial + unpaid
  const expectedDebts = debts.reduce(
    (acc, d) => acc + (d.amountBilled || d.amountOwed),
    0
  );

  // Optional: per-debtor breakdown
  const debtorBalances = debts.reduce((acc, d) => {
    const name = d.debtorName || "Unknown";
    if (!acc[name]) acc[name] = 0;
    acc[name] += d.amountOwed;
    return acc;
  }, {});

  let unclearedIncomingDebts = debts.filter(
    (d) => d.type == "income" && d.amountOwed != 0
  );
  //unclearedIncomingDebts=unclearedIncomingDebts.map(d => (...d),)
  let unclearedOutgoingDebts = debts.filter(
    (d) => d.type == "expense" && d.status == "pending"
  );

  return {
    clearedDebts,
    partialDebts,
    unpaidDebts,
    expectedDebts,
    debtorBalances,
    totalDebt: clearedDebts + partialDebts + unpaidDebts,
    unclearedIncomingDebts,
    unclearedOutgoingDebts,
  };
}
