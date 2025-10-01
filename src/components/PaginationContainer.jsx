import "../styles/PaginationContainer.css";
export default function PaginationContainer({
  currentPage,
  totalPages,
  setPage,
  maxButtons = 5,
}) {
  const buttons = [];

  // calculate start and end for page buttons
  let start = Math.max(currentPage - Math.floor(maxButtons / 2), 1);
  let end = Math.min(start + maxButtons - 1, totalPages);

  // adjust start if we’re at the end
  start = Math.max(end - maxButtons + 1, 1);

  for (let i = start; i <= end; i++) {
    buttons.push(i);
  }

  return (
    <div className="pagination-container">
      <button
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="pgn-btn"
      >
        Prev
      </button>

      {buttons.map((num) => (
        <button
          key={num}
          onClick={() => setPage(num)}
          className={`pgn-btn ${num === currentPage ? "active" : ""}`}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pgn-btn"
      >
        Next
      </button>
    </div>
  );
}
