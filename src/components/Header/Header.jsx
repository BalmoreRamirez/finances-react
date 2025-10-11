import './Header.css';

export const Header = ({ title, subtitle, children }) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        <div className="header-actions">
          {children}
        </div>
      </div>
    </div>
  );
};
