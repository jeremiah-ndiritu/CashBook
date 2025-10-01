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
      acc[method] += t.deposit || 0;
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
