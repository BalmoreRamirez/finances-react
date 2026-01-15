import { useState } from 'react';
import './Header.css';

export const Header = ({ onLogout, userEmail }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const userName = userEmail?.split('@')[0] || 'Usuario';
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <header className="app-header-bar">
      <div className="header-container">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="header-brand">
            <div className="brand-icon">💰</div>
            <span className="brand-name">FinanceApp</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-menu-container">
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
            >
              <div className="user-avatar">{initials}</div>
              <span className="user-name">{userName}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-avatar-large">{initials}</div>
                  <div className="user-info">
                    <div className="user-info-name">{userName}</div>
                    <div className="user-info-email">{userEmail}</div>
                  </div>
                </div>
                <div className="user-menu-divider"></div>
                <button className="user-menu-item" onClick={onLogout}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 2H3a1 1 0 00-1 1v10a1 1 0 001 1h2m4-4l3-3m0 0l-3-3m3 3H7"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
