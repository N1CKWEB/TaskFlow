// src/hooks/useAuth.js
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  const getUser = () => {
    return {
      id: localStorage.getItem("usuario_id"),
      nombre: localStorage.getItem("nombre_usuario"),
      rol_id: parseInt(localStorage.getItem("rol_id")),
      rol_codigo: localStorage.getItem("rol_codigo"),
      token: localStorage.getItem("token")
    };
  };

  const isDueño = () => {
    const rol = parseInt(localStorage.getItem("rol_id"));
    return rol === 1;
  };

  const isLider = () => {
    const rol = parseInt(localStorage.getItem("rol_id"));
    return rol === 2;
  };

  const isDesarrollador = () => {
    const rol = parseInt(localStorage.getItem("rol_id"));
    return rol === 3;
  };

  const canCreateProjects = () => {
    const rol = parseInt(localStorage.getItem("rol_id"));
    return rol === 1 || rol === 2; // Dueño o Líder
  };

  const canCreateTasks = () => {
    const rol = parseInt(localStorage.getItem("rol_id"));
    return rol === 1 || rol === 2; // Dueño o Líder
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("nombre_usuario");
    localStorage.removeItem("rol_id");
    localStorage.removeItem("rol_codigo");
    navigate("/login");
  };

  return {
    getUser,
    isDueño,
    isLider,
    isDesarrollador,
    canCreateProjects,
    canCreateTasks,
    logout
  };
};