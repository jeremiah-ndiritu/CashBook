import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Workspace from "./pages/Workspace";
import Dashboard from "./pages/Dashboard";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-nav">
        <h2>💼 CashBook</h2>
        <nav>
          <Link to="/">Workspace</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </div>

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Workspace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
