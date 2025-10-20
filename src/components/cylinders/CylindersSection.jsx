import "./CylindersSection.css";
import CylinderItem from "./CylinderItem";
export default function CylindersSection({ cylinders }) {
  return (
    <>
      <h3>📦 Current Stock</h3>
      <div className="cylinders-section">
        {cylinders.map((c) => (
          <CylinderItem key={Math.random()} cylinder={c} />
        ))}
      </div>
    </>
  );
}
