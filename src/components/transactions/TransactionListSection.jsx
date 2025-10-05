import { useState, useEffect } from "react";
import PaginationContainer from "../PaginationContainer";
import TransactionList from "./TransactionList";
import { getPage, getStoreCount } from "../../db";

export default function TransactionListSection({ refresh }) {
  const PAGE_SIZE = 5;

  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // fetch total pages
  useEffect(() => {
    const fetchTotalPages = async () => {
      const count = await getStoreCount("transactions");
      setTotalPages(Math.ceil(count / PAGE_SIZE) || 1);
    };
    fetchTotalPages();
  }, [refresh]);

  // fetch current page data
  useEffect(() => {
    const fetchPage = async () => {
      const data = await getPage("transactions", currentPage, PAGE_SIZE);
      setTransactions(data);
    };
    fetchPage();
  }, [currentPage, refresh]);

  return (
    <div className="tl-section">
      <h2>Transactions - Page {currentPage}</h2>
      <TransactionList transactions={transactions} />
      <PaginationContainer
        currentPage={currentPage}
        totalPages={totalPages}
        setPage={setCurrentPage}
        maxButtons={5}
      />
    </div>
  );
}
