import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { addCylinder } from "../../utils/cylinders.js";
import "./AddCylinder.css";
export default function AddCylinder({ setCylinders }) {
  const [newCylinder, setNewCylinder] = useState({
    name: "",
    capacity: "",
    cylinderBuyingPrice: "",
    gasBuyingPrice: "",
    sellingPrice: "",
    refillPrice: "",
    quantity: 1,
  });

  async function handleAddCylinder(e) {
    e.preventDefault();
    let valid = validateCylinder(newCylinder);
    if (!valid) {
      return;
    }

    const addedCylinder = await addCylinder(newCylinder);
    if (setCylinders) {
      setCylinders((prev) => [addedCylinder, ...prev]);
    }
    toast.success("Gas cylinder added successfully!");
    setNewCylinder({
      name: "",
      capacity: "",
      cylinderBuyingPrice: "",
      gasBuyingPrice: "",
      sellingPrice: "",
      refillPrice: "",
      quantity: 1,
    });
  }

  return (
    <div className="dashboard">
      <h2>🧯 Gas Cylinder Stock</h2>
      <form onSubmit={handleAddCylinder}>
        <input
          placeholder="Name"
          value={newCylinder.name}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, name: e.target.value })
          }
        />
        <input
          placeholder="Capacity"
          value={newCylinder.capacity}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, capacity: e.target.value })
          }
        />
        <input
          placeholder="Cylinder Buying Price"
          value={newCylinder.cylinderBuyingPrice}
          onChange={(e) =>
            setNewCylinder({
              ...newCylinder,
              cylinderBuyingPrice: e.target.value,
            })
          }
        />
        <input
          placeholder="Gas Buying Price"
          value={newCylinder.gasBuyingPrice}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, gasBuyingPrice: e.target.value })
          }
        />
        <input
          placeholder="Selling Price"
          value={newCylinder.sellingPrice}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, sellingPrice: e.target.value })
          }
        />
        <input
          placeholder="Refill Price"
          value={newCylinder.refillPrice}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, refillPrice: e.target.value })
          }
        />
        <input
          placeholder="Quantity"
          value={newCylinder.quantity}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, quantity: e.target.value })
          }
        />
        <button type="submit">Add Cylinder</button>
      </form>

      <ToastContainer position="top-right" />
    </div>
  );
}

function validateCylinder(newCylinder) {
  // 1️⃣ Name
  if (!newCylinder.name || newCylinder.name.trim() === "") {
    toast.error("Please enter the cylinder name!");
    return false;
  }

  // 2️⃣ Capacity
  if (!newCylinder.capacity || isNaN(newCylinder.capacity)) {
    toast.error("Please enter a valid numeric capacity (e.g. 6, 13, 50)!");
    return false;
  }

  // 3️⃣ Cylinder Buying Price
  if (
    newCylinder.cylinderBuyingPrice === "" ||
    isNaN(newCylinder.cylinderBuyingPrice) ||
    parseFloat(newCylinder.cylinderBuyingPrice) <= 0
  ) {
    toast.error("Please enter a valid cylinder buying price!");
    return false;
  }

  // 4️⃣ Gas Buying Price
  if (
    newCylinder.gasBuyingPrice === "" ||
    isNaN(newCylinder.gasBuyingPrice) ||
    parseFloat(newCylinder.gasBuyingPrice) < 0
  ) {
    toast.error("Please enter a valid gas buying price!");
    return false;
  }

  // 5️⃣ Selling Price
  if (
    newCylinder.sellingPrice === "" ||
    isNaN(newCylinder.sellingPrice) ||
    parseFloat(newCylinder.sellingPrice) <= 0
  ) {
    toast.error("Please enter a valid selling price!");
    return false;
  }

  // 6️⃣ Refill Price
  if (
    newCylinder.refillPrice === "" ||
    isNaN(newCylinder.refillPrice) ||
    parseFloat(newCylinder.refillPrice) <= 0
  ) {
    toast.error("Please enter a valid refill price!");
    return false;
  }

  // 7️⃣ Quantity
  if (
    newCylinder.quantity === "" ||
    isNaN(newCylinder.quantity) ||
    parseInt(newCylinder.quantity) < 0
  ) {
    toast.error("Please enter a valid quantity (0 or more)!");
    return false;
  }

  return true; // ✅ Passed all checks
}
