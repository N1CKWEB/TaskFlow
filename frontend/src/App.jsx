import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import DashboardTeam from "./pages/dashboardTeam.jsx";
import Setting from "./pages/Settings.jsx";
// import DashboardTeam from "./pages/login.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard-team" element={<DashboardTeam />} />
      <Route path="/settings" element={<Setting />} />
    </Routes>
  );
}

export default App;
