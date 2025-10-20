import AddCylinder from "../components/cylinders/AddCylinder";
import CylindersSummary from "../components/cylinders/CylindersSummary";
import { useEffect, useState } from "react";
import { getCylinders } from "../utils/cylinders";
import "./Dashboard.css";
import CylindersSection from "../components/cylinders/CylindersSection";
export default function Dashboard() {
  const [cylinders, setCylinders] = useState([]);
  useEffect(() => {
    const loadCylinders = async () => {
      let data = await getCylinders();
      setCylinders(data);
    };
    loadCylinders();
  }, []);
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <CylindersSummary cylinders={cylinders} />
      <AddCylinder setCylinders={setCylinders} />
      <CylindersSection cylinders={cylinders} />
    </div>
  );
}
