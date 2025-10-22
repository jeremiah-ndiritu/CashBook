import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { addCylinder } from "../../utils/cylinders.js";
import "./AddCylinder.css";

export default function AddCylinder({ setCylinders }) {
  const [newCylinder, setNewCylinder] = useState({
    name: "",
    capacity: "",
    quantity: "",
    empty: "",
    full: "",
  });

  async function handleAddCylinder(e) {
    e.preventDefault();
    let valid = validateCylinder(newCylinder);
    if (!valid) return;

    const addedCylinder = await addCylinder(newCylinder);
    if (setCylinders) {
      setCylinders((prev) => [addedCylinder, ...prev]);
    }
    toast.success("Gas cylinder added successfully!");

    setNewCylinder({
      name: "",
      capacity: "",
      quantity: "",
      empty: "",
      full: "",
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
          type="number"
          placeholder="Quantity"
          value={newCylinder.quantity}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, quantity: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Empty"
          value={newCylinder.empty}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, empty: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Full"
          value={newCylinder.full}
          onChange={(e) =>
            setNewCylinder({ ...newCylinder, full: e.target.value })
          }
        />
        <button type="submit">Add Cylinder</button>
      </form>

      <ToastContainer position="top-right" />
    </div>
  );
}

function validateCylinder(newCylinder) {
  if (!newCylinder.name.trim()) {
    toast.error("Please enter the cylinder name!");
    return false;
  }

  if (!newCylinder.capacity || isNaN(newCylinder.capacity)) {
    toast.error("Please enter a valid numeric capacity (e.g. 6, 13, 50)!");
    return false;
  }

  if (
    newCylinder.quantity === "" ||
    isNaN(newCylinder.quantity) ||
    parseInt(newCylinder.quantity) < 0
  ) {
    toast.error("Please enter a valid quantity (0 or more)!");
    return false;
  }

  if (
    Number(newCylinder.quantity) !==
    Number(newCylinder.empty) + Number(newCylinder.full)
  ) {
    toast.error(
      "The full and empty cylinders do not add up well to the right quantity!"
    );
    return false;
  }

  return true;
}
