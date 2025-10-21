// Sidebar.jsx
import React, { useEffect, useState } from 'react';
import '../styles/sidebar.css';

const Sidebar = () => {
  const [color, setColor] = useState(localStorage.getItem('sidebarColor') || '#2C2F36');

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-bg', color);
  }, [color]);

  return (
    <aside className="sidebar" style={{ backgroundColor: color }}>
      {/* tu contenido */}
    </aside>
  );
};

export default Sidebar;
