import './Sidebar.css';

export const Sidebar = ({ currentView, onViewChange, onLogout, userEmail }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', view: 'dashboard' },
    { id: 'transactions', icon: '💳', label: 'Transacciones', view: 'transactions' },
    { id: 'accounts', icon: '🏦', label: 'Cuentas', view: 'accounts' },
    { id: 'investments', icon: '💎', label: 'Inversiones', view: 'investments' },
    { id: 'settings', icon: '⚙️', label: 'Configuración', view: 'settings' },
  ];

  const userInitial = userEmail?.charAt(0).toUpperCase() || 'U';
  const userName = userEmail ? userEmail.split('@')[0] : 'Usuario';

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {menuItems.map(item => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onViewChange(item.view)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">{userInitial}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-email">{userEmail}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
