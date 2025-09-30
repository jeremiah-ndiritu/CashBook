// src/components/ExportPDF.jsx
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/ExportPDF.css";

// Helper: get local YYYY-MM-DD
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ExportPDF({ transactions }) {
  const [reportType, setReportType] = useState("today");

  // Filter transactions based on report type
  const filterTransactions = () => {
    const now = new Date();
    const todayKey = getLocalDateKey(now);

    if (reportType === "today") {
      return transactions.filter((t) => t.dayKey === todayKey);
    }

    if (reportType === "last7") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6); // last 7 days including today
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

  const generatePDF = (mode = "full") => {
    const filtered = filterTransactions();
    const doc = new jsPDF();

    // Header banner
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);

    let reportTitle = "Cashbook Report";
    if (reportType === "today") reportTitle += " – Today";
    if (reportType === "last7") reportTitle += " – Last 7 Days";
    if (reportType === "month") reportTitle += " – This Month";
    if (reportType === "all") reportTitle += " – All Records";

    doc.text(reportTitle, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 20, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);

    if (filtered.length === 0) {
      doc.setFontSize(14);
      doc.text("No transactions found for this report.", 14, 50);
      doc.save(`cashbook-report-${getLocalDateKey()}.pdf`);
      return;
    }

    // Totals
    let income = 0;
    let expense = 0;
    filtered.forEach((t) => {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
    });
    const balance = income - expense;

    // Show summary totals
    doc.setFontSize(12);
    doc.setTextColor(0, 200, 10);
    doc.text(`Total Income: Ksh ${income.toFixed(2)}`, 14, 40);
    doc.setTextColor(240, 0, 0);
    doc.text(`Total Expense: Ksh ${expense.toFixed(2)}`, 14, 48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`Balance: Ksh ${balance.toFixed(2)}`, 14, 60);

    // Summary mode: only show latest 5 transactions
    if (mode === "summary") {
      const latest = filtered
        .slice(-5)
        .map((t) => [
          getLocalDateKey(new Date(t.date)),
          t.type.charAt(0).toUpperCase() + t.type.slice(1),
          `Ksh ${t.amount.toFixed(2)}`,
        ]);

      autoTable(doc, {
        head: [["Date", "Type", "Amount"]],
        body: latest,
        startY: 75,
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      });

      doc.save(`cashbook-summary-${getLocalDateKey()}.pdf`);
      return;
    }

    // Full report table
    const rows = filtered.map((t) => [
      getLocalDateKey(new Date(t.date)),
      t.description,
      t.paymentMethod || "N/A",
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      `Ksh ${t.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Date", "Description", "Payment Method", "Type", "Amount"]],
      body: rows,
      startY: 75,
      styles: { fontSize: 11, cellPadding: 3 },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      bodyStyles: { halign: "center" },
    });

    doc.save(`cashbook-report-${getLocalDateKey()}.pdf`);
  };

  return (
    <div className="export-box">
      <h3>Select Report Type</h3>
      <div className="report-options">
        {["today", "last7", "month", "all"].map((type) => (
          <label key={type}>
            <input
              type="radio"
              value={type}
              checked={reportType === type}
              onChange={(e) => setReportType(e.target.value)}
            />
            {type === "today" && "Today"}
            {type === "last7" && "Last 7 Days"}
            {type === "month" && "This Month"}
            {type === "all" && "All Records"}
          </label>
        ))}
      </div>

      <button
        onClick={() => generatePDF("summary")}
        className="export-btn summary"
      >
        Export Summary PDF
      </button>

      <button onClick={() => generatePDF("full")} className="export-btn full">
        Export Full Report PDF
      </button>
    </div>
  );
}
