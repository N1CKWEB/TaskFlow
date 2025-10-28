import { Routes, Route } from "react-router-dom"; // Sin BrowserRouter
import Home from "./pages/Home.jsx";
import DashboardTeam from "./pages/dashboardTeam.jsx";
import Setting from "./pages/Settings.jsx";
import Login from "./pages/login.jsx";
import GestorTareas from "./pages/gestorTareas.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard-team" element={<DashboardTeam />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/tareas" element={<GestorTareas />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;