// src/components/ExportPDF.jsx
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // install via: npm install jspdf jspdf-autotable
import "../styles/ExportPDF.css";

export default function ExportPDF({ transactions }) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header background
    doc.setFillColor(22, 163, 74); // green
    doc.rect(0, 0, 210, 30, "F"); // full-width rectangle

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Cashbook Report", 14, 20);

    // Sub-header
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 150, 20, {
      align: "right",
    });

    // Reset text color for content
    doc.setTextColor(0, 0, 0);

    let income = 0;
    let expense = 0;

    // Prepare table rows
    const rows = transactions.map((t) => {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
      return [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `Ksh ${t.amount.toFixed(2)}`,
      ];
    });

    // Build table
    autoTable(doc, {
      head: [["Date", "Description", "Type", "Amount"]],
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

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    const balance = income - expense;

    doc.setFontSize(12);
    doc.text(`Total Income: Ksh ${income.toFixed(2)}`, 14, finalY);
    doc.text(`Total Expense: Ksh ${expense.toFixed(2)}`, 14, finalY + 8);
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`Balance: Ksh ${balance.toFixed(2)}`, 14, finalY + 20);

    // Save file
    doc.save(`cashbook-report-${Date.now()}.pdf`);
  };

  return (
    <button onClick={generatePDF} className="export-btn">
      Export PDF
    </button>
  );
}
