import './Sidebar.css';

export const Sidebar = ({ currentView, onViewChange, onLogout, userEmail }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', view: 'dashboard', accent: '#6366f1', soft: '#eef2ff' },
    { id: 'transactions', icon: '💳', label: 'Transacciones', view: 'transactions', accent: '#f97316', soft: '#fef3c7' },
    { id: 'accounts', icon: '🏦', label: 'Cuentas', view: 'accounts', accent: '#0ea5e9', soft: '#e0f2fe' },
    { id: 'investments', icon: '💎', label: 'Inversiones', view: 'investments', accent: '#10b981', soft: '#d1fae5' },
    { id: 'analytics', icon: '📈', label: 'Análisis', view: 'analytics', accent: '#8b5cf6', soft: '#ede9fe' },
    { id: 'settings', icon: '⚙️', label: 'Configuración', view: 'settings', accent: '#f59e0b', soft: '#fef3c7' },
  ];

  const handleNavigate = (view) => {
    onViewChange(view);
    // Cerrar offcanvas en móvil al navegar
    const offcanvasElement = document.getElementById('appSidebar');
    if (offcanvasElement && window.bootstrap) {
      const instance = window.bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (instance) instance.hide();
    }
  };

  const userInitial = userEmail?.charAt(0).toUpperCase() || 'U';
  const userName = userEmail ? userEmail.split('@')[0] : 'Invitado';

  return (
    <div
      className="offcanvas offcanvas-start offcanvas-lg"
      tabIndex="-1"
      id="appSidebar"
      aria-labelledby="appSidebarLabel"
      style={{ '--bs-offcanvas-width': '260px' }}
    >
      <div className="offcanvas-header d-flex d-lg-none align-items-center justify-content-between border-0 px-3 pt-3">
        <h5 className="offcanvas-title mb-0" id="appSidebarLabel">Menú</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
      </div>
      <div className="offcanvas-body p-0">
        <div className="sidebar-shell">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon" aria-hidden="true">💰</div>
            <div className="sidebar-brand-meta">
              <span className="sidebar-brand-title">FinanceApp</span>
              <span className="sidebar-brand-subtitle">Control de finanzas</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Secciones principales">
            {menuItems.map(item => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.view)}
                  style={{ '--sidebar-accent': item.accent, '--sidebar-accent-soft': item.soft }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="sidebar-user-avatar" aria-hidden="true">{userInitial}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-label">Sesión activa</span>
                <span className="sidebar-user-name">{userName}</span>
                <span className="sidebar-user-email">{userEmail || 'Invitado'}</span>
              </div>
            </div>
            <button type="button" className="sidebar-logout" onClick={onLogout}>
              <span aria-hidden="true">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
