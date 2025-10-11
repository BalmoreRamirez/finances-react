import { useState } from 'react';
import './Sidebar.css';

export const Sidebar = ({ currentView, onViewChange, onLogout, userEmail }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', view: 'dashboard' },
    { id: 'transactions', icon: '💳', label: 'Transacciones', view: 'transactions' },
    { id: 'analytics', icon: '📈', label: 'Análisis', view: 'analytics' },
    { id: 'settings', icon: '⚙️', label: 'Configuración', view: 'settings' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">💰</span>
          {!collapsed && <span className="logo-text">FinanceApp</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Contraer'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.view ? 'active' : ''}`}
            onClick={() => onViewChange(item.view)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-section">
          <div className="user-avatar">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-email">{userEmail}</span>
            </div>
          )}
        </div>
        <button 
          className="logout-btn"
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <span className="logout-icon">🚪</span>
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
