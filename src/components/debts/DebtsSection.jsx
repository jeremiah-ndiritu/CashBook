// src/components/DebtsSection.jsx
import { useState, useEffect } from "react";
import DebtsList from "./DebtsList";
import PaginationContainer from "../PaginationContainer";
import { getPage, getStoreCount } from "../../db"; // your IndexedDB helpers

export default function DebtsSection({ onUpdateDebt, refresh }) {
  const [debts, setDebts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 5; // debts per page

  useEffect(() => {
    const fetchTotalPages = async () => {
      const count = await getStoreCount("transactions");
      setTotalPages(Math.ceil(count / PAGE_SIZE) || 1);
    };
    fetchTotalPages();
  }, [refresh]);
  // Fetch page whenever page changes
  useEffect(() => {
    const fetchDebts = async () => {
      const pageData = await getPage("debts", currentPage, PAGE_SIZE);
      setDebts(pageData);

      const total = await getStoreCount("debts");
      setTotalPages(Math.ceil(total / PAGE_SIZE));
    };

    fetchDebts();
  }, [currentPage, refresh]);

  // Callback for updating a debt

  return (
    <div className="debts-section">
      <DebtsList debts={debts} onUpdateDebt={onUpdateDebt} />
      {totalPages > 1 && (
        <PaginationContainer
          currentPage={currentPage}
          totalPages={totalPages}
          setPage={setCurrentPage}
          maxButtons={5}
        />
      )}
    </div>
  );
}
