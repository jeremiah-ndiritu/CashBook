import { useEffect, useState } from "react";
import "./CylindersSummary.css";

export default function CylindersSummary({ cylinders = [] }) {
  const [display, setDisplay] = useState({
    totalQty: 0,
    totalTypes: 0,
    totalFull: 0,
    totalEmpty: 0,
  });

  // Compute summaries
  const totalQty = cylinders.reduce(
    (acc, c) => acc + Number(c.quantity || 0),
    0
  );
  const totalTypes = cylinders.length;
  const totalFull = cylinders.reduce((acc, c) => acc + Number(c.full || 0), 0);
  const totalEmpty = cylinders.reduce(
    (acc, c) => acc + Number(c.empty || 0),
    0
  );

  useEffect(() => {
    const duration = 800;
    const start = performance.now();

    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay({
        totalQty: Math.floor(p * totalQty),
        totalTypes: Math.floor(p * totalTypes),
        totalFull: Math.floor(p * totalFull),
        totalEmpty: Math.floor(p * totalEmpty),
      });
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [totalQty, totalTypes, totalFull, totalEmpty]);

  return (
    <div className="cylinder-summary">
      <div className="summary-card">
        <h4>Total Cylinders</h4>
        <p>{display.totalQty}</p>
      </div>
      <div className="summary-card">
        <h4>Types</h4>
        <p>{display.totalTypes}</p>
      </div>
      <div className="summary-card">
        <h4>Full</h4>
        <p>{display.totalFull}</p>
      </div>
      <div className="summary-card">
        <h4>Empty</h4>
        <p>{display.totalEmpty}</p>
      </div>
    </div>
  );
}
