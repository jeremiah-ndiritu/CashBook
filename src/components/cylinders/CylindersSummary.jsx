import { useEffect, useState } from "react";
import "./CylindersSummary.css";
export default function CylindersSummary({ cylinders = [] }) {
  const [display, setDisplay] = useState({
    totalTypes: 0,
    totalQty: 0,
    totalValue: 0,
  });

  // Actual values
  const totalTypes = cylinders.length;
  const totalQty = cylinders.reduce(
    (acc, c) => acc + Number(c.quantity || 0),
    0
  );
  const totalValue = cylinders.reduce(
    (acc, c) =>
      acc +
      (Number(c.cylinderBuyingPrice || 0) + Number(c.gasBuyingPrice || 0)) *
        Number(c.quantity || 0),
    0
  );

  useEffect(() => {
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);

      setDisplay({
        totalTypes: Math.floor(progress * totalTypes),
        totalQty: Math.floor(progress * totalQty),
        totalValue: Math.floor(progress * totalValue),
      });

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [totalTypes, totalQty, totalValue]);

  return (
    <div className="cylinder-summary">
      {/* 📊 Summary Cards */}
      <div className="summary-card">
        <h4>Total Types</h4>
        <p>{display.totalTypes}</p>
      </div>

      <div className="summary-card">
        <h4>Total Quantity</h4>
        <p>{display.totalQty}</p>
      </div>

      <div className="summary-card">
        <h4>Total Stock Value</h4>
        <p>
          Ksh{" "}
          {display.totalValue.toLocaleString("en-KE", {
            minimumFractionDigits: 0,
          })}
        </p>
      </div>
    </div>
  );
}
