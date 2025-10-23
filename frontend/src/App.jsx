import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import DashboardTeam from "./pages/dashboardTeam.jsx";
import Setting from "./pages/Settings.jsx";
import Login from "./pages/login.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard-team" element={<DashboardTeam />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
