import "./CylinderItem.css";
export default function CylinderItem({ cylinder }) {
  return (
    <div className="cylinder-item">
      <div className="cylinder-name">{cylinder.name}</div>
      <div className="cylinder-capacity">
        {cylinder.capacity}
        {cylinder.capacityUnit || "kg"}
      </div>
      <div className="cylinder-prices">
        <span>💰 Buy: {cylinder.cylinderBuyingPrice}</span>
        <span>🛢 Gas: {cylinder.gasBuyingPrice}</span>
        <span>💵 Sell: {cylinder.sellingPrice}</span>
        <span>🔄 Refill: {cylinder.refillPrice}</span>
      </div>
      <div className="cylinder-quantity">📦 Qty: {cylinder.quantity}</div>
    </div>
  );
}
