import "./CylinderItem.css";
export default function CylinderItem({ cylinder }) {
  return (
    <div className="cylinder-item">
      <div className="cylinder-name">{cylinder.name}</div>
      <div className="cylinder-capacity">
        {cylinder.capacity}
        {cylinder.capacityUnit || "kg"}
      </div>
      <div className="c-stats">
        <span>Full: {cylinder.full}</span>
        <span>Empty: {cylinder.empty}</span>
      </div>

      <div className="cylinder-quantity">📦 Total: {cylinder.quantity}</div>
    </div>
  );
}
