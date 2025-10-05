// src/components/ExportPDF.jsx
import { useState } from "react";
import jsPDF from "jspdf";
import "../styles/ExportPDF.css";

import { filterTransactions, makeReportTitle } from "../utils/utils";
import { getIncomeTotals } from "../utils/income";
import { getExpenseTotals } from "../utils/expenses";

import { filterDebts } from "../utils/utils";
import { summaryReport } from "../utils/summary_report";
import { toast } from "react-toastify";
import { fullReport } from "../utils/full_report";
export default function ExportPDF({ transactions, debts }) {
  const [reportType, setReportType] = useState("today");

  // Filter transactions based on report type

  const generatePDF = (mode = "full") => {
    const filteredTransactions = filterTransactions(transactions, reportType);
    if (filteredTransactions.length === 0) {
      toast.error("There are no transactions for this report!");
      return;
    }
    debts = filterDebts(debts, filteredTransactions);

    let incomeTotals = getIncomeTotals(debts, filteredTransactions);
    let expenseTotals = getExpenseTotals(debts, filteredTransactions);

    const doc = new jsPDF();

    // Header banner
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);

    let reportTitle = makeReportTitle(mode, reportType);

    // Title and generated text
    doc.text(reportTitle, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 18, {
      align: "right",
    });

    doc.setTextColor(0, 0, 0);

    // ✅ SUMMARY MODE TABLES
    if (mode === "summary") {
      summaryReport(doc, incomeTotals, expenseTotals);
      return; // prevent double-saving
    }
    if (mode == "full") {
      fullReport(
        doc,
        40,
        filteredTransactions,
        debts,
        incomeTotals,
        expenseTotals
      );
      return;
    }
  };

  return (
    <div className="export-box">
      <h3>Select Report Type</h3>
      <div className="report-options">
        {["today", "yesterday", "last7", "month", "all"].map((type) => (
          <label key={type}>
            <input
              type="radio"
              value={type}
              checked={reportType === type}
              onChange={(e) => setReportType(e.target.value)}
            />
            {type === "today" && "Today"}
            {type === "yesterday" && "Yesterday"}
            {type === "last7" && "Last 7 Days"}
            {type === "month" && "This Month"}
            {type === "all" && "All Records"}
          </label>
        ))}
      </div>

      <div className="buttons">
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
    </div>
  );
}
