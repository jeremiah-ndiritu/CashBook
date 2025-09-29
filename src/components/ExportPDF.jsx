// src/components/ExportPDF.jsx
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/ExportPDF.css";

export default function ExportPDF({ transactions }) {
  const [reportType, setReportType] = useState("today");

  // Filter transactions by type
  const filterTransactions = () => {
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];

    if (reportType === "today") {
      return transactions.filter((t) => t.dayKey === todayKey);
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

  const generatePDF = () => {
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
      doc.save(`cashbook-report-${new Date().toISOString().split("T")[0]}.pdf`);
      return;
    }

    // Totals
    let income = 0;
    let expense = 0;
    const rows = filtered.map((t) => {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
      return [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.paymentMethod || "N/A",
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `Ksh ${t.amount.toFixed(2)}`,
      ];
    });

    // Table
    autoTable(doc, {
      head: [["Date", "Description", "Payment Method", "Type", "Amount"]],
      body: rows,
      startY: 40,
      styles: { fontSize: 11, cellPadding: 3 },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { halign: "center" },
    });

    // Totals & Balance
    const finalY = doc.lastAutoTable.finalY + 10;
    const balance = income - expense;

    doc.setFontSize(12);
    doc.setTextColor(0, 200, 10, 0.9);
    doc.text(`Total Income: Ksh ${income.toFixed(2)}`, 14, finalY);
    doc.setTextColor(240, 0, 0, 0.9);
    doc.text(`Total Expense: Ksh ${expense.toFixed(2)}`, 14, finalY + 8);
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`Balance: Ksh ${balance.toFixed(2)}`, 14, finalY + 20);

    // File name → YYYY-MM-DD
    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`cashbook-report-${dateStr}.pdf`);
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

      <button onClick={generatePDF} className="export-btn">
        Export PDF
      </button>
    </div>
  );
}
