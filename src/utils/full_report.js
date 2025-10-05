import { getLocalDateKey, getLocalDateTimeKey } from "./utils";
import autoTable from "jspdf-autotable";
/**
 *
 * @param {jsPDF} doc
 * @param {Array} transactions
 * @param {Array} debts
 * @param {Object} incomeTotals
 * @param {Object} expenseTotals
 */
export function fullReport(
  doc,
  y,
  transactions,
  debts,
  incomeTotals,
  expenseTotals
) {
  let income = Object.values(incomeTotals).reduce((sum, v) => sum + v, 0);
  let expense = Object.values(expenseTotals).reduce((sum, v) => sum + v, 0);
  let balance = income - expense;
  // Summary totals - with clean spacing
  doc.setFontSize(12);
  doc.setTextColor(0, 200, 10);
  doc.text(`Total Income: Ksh ${income.toFixed(2)}`, 14, y);
  y += 8;
  doc.setTextColor(240, 0, 0);
  doc.text(`Total Expense: Ksh ${expense.toFixed(2)}`, 14, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text(`Balance: Ksh ${balance.toFixed(2)}`, 14, y);
  y += 15;
  // Full transactions table
  const rows = transactions
    .filter((t) => t) // skip undefined
    .map((t) => [
      getLocalDateKey(new Date(t.date)),
      t.description || "-",
      t.paymentMethod || "N/A",
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      (t.deposit || t.amount)?.toFixed(2),
    ]);

  if (rows.length > 0) {
    autoTable(doc, {
      head: [["Date", "Description", "Payment Method", "Type", "Amount (Ksh)"]],
      body: rows,
      startY: 75,
      styles: { fontSize: 11, cellPadding: 3 },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      bodyStyles: { halign: "center" },
    });
  }

  // Debts table
  if (debts && debts.length > 0) {
    const debtRows = debts
      .filter((d) => d && d.amountOwed != null)
      .map((d) => [
        d.debtorName || "-",
        d.debtorNumber || "-",
        d.type === "income" ||
        d.type == "" ||
        d.type == undefined ||
        d.type == null
          ? "Expected Income"
          : "Expected Expense",
        `Ksh ${d.amountOwed.toFixed(2)}`,
        d.date ? getLocalDateKey(new Date(d.date)) : "-",
      ]);

    if (debtRows.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(22, 163, 74);
      doc.text("Debts / Credit Records", 14, 20);

      autoTable(doc, {
        head: [["Debtor", "Phone", "Type", "Amount Owed", "Date"]],
        body: debtRows,
        startY: 30,
        styles: { fontSize: 11, cellPadding: 3 },
        headStyles: {
          fillColor: [22, 163, 74],
          textColor: 255,
          halign: "center",
        },
        bodyStyles: { halign: "center" },
      });

      // Totals below debts table
      const finalY = doc.lastAutoTable.finalY + 10;

      const totalExpectedIncome = debts
        .filter((d) => d?.type === "income" && d.amountOwed != null)
        .reduce((sum, d) => sum + d.amountOwed, 0);

      const totalExpectedExpense = debts
        .filter((d) => d.type === "expense" && d.amountOwed != null)
        .reduce((sum, d) => sum + d.amountOwed, 0);

      // Display totals
      doc.setFontSize(12);
      doc.setTextColor(0, 200, 0); // green for expected income
      doc.text(
        `Total Expected Income: Ksh ${totalExpectedIncome.toFixed(2)}`,
        14,
        finalY
      );

      doc.setTextColor(240, 0, 0); // red for expected expense
      doc.text(
        `Total Expected Expense: Ksh ${totalExpectedExpense.toFixed(2)}`,
        14,
        finalY + 8
      );

      // Net Debts: income - expense
      const netDebts = totalExpectedIncome - totalExpectedExpense;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      if (netDebts >= 0) {
        doc.setTextColor(0, 150, 0); // positive, green
      } else {
        doc.setTextColor(200, 0, 0); // negative, red
      }
      doc.text(`Net Debts: Ksh ${netDebts.toFixed(2)}`, 14, finalY + 20);
    }
  }

  doc.save(`cashbook-report-${getLocalDateTimeKey()}.pdf`);
}
