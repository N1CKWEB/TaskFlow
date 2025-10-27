import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import DashboardTeam from "./pages/dashboardTeam.jsx";
import Setting from "./pages/Settings.jsx";
import Login from "./pages/login.jsx";
import GestorTareas from "./pages/gestorTareas.jsx"; // Agregar

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard-team" element={<DashboardTeam />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tareas" element={<GestorTareas />} /> {/* Nueva ruta */}
    </Routes>
  );
}

export default App;