import autoTable from "jspdf-autotable";
import { getLocalDateTimeKey } from "../utils/utils.js";

/**
 * Generates the summary page of the Cashbook PDF report
 * @param {jsPDF} doc - The jsPDF instance
 * @param {Object} incomeTotals - Object containing income and expense breakdowns
 * @param {Object} expenseTotals
 */
export function summaryReport(doc, incomeTotals, expenseTotals) {
  // 🟩 No new page — continues on the same one
  const startY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 20;

  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74);
  doc.text("Summary Overview", 14, startY);

  // --- Income per Account Table ---
  const incomeRows = Object.entries(incomeTotals || {}).map(
    ([account, amount]) => [
      account.toUpperCase(),
      amount.toFixed(2),
      expenseTotals[account]?.toFixed(2) || "0.00",
      (amount - (expenseTotals[account] || 0)).toFixed(2),
    ]
  );

  if (incomeRows.length > 0) {
    // 🧮 Calculate Totals
    const totalIncome = Object.values(incomeTotals).reduce((a, b) => a + b, 0);
    const totalExpense = Object.values(expenseTotals).reduce(
      (a, b) => a + b,
      0
    );
    const totalNet = totalIncome - totalExpense;

    // Add totals row (bold + distinct)
    incomeRows.push([
      "TOTAL",
      totalIncome.toFixed(2),
      totalExpense.toFixed(2),
      totalNet.toFixed(2),
    ]);

    const tableStartY = startY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 0);
    doc.text("Income by Account", 14, tableStartY);

    autoTable(doc, {
      head: [["Account", "Income (Ksh)", "Expense (Ksh)", "Net Balance (Ksh)"]],
      body: incomeRows,
      startY: tableStartY + 5,
      styles: { fontSize: 11, cellPadding: 3 },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      bodyStyles: { halign: "start" },
      // 🟢 Highlight TOTAL row
      didParseCell: function (data) {
        const rowIndex = data.row.index;
        if (rowIndex === incomeRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [230, 255, 230]; // light green
        }
      },
    });
  }

  // ✅ Save & return
  doc.save(`cashbook-summary-${getLocalDateTimeKey()}.pdf`);
  return;
}
