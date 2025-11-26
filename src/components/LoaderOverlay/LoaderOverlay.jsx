import './LoaderOverlay.css';

export const LoaderOverlay = ({ visible = false, message = 'Cargando datos...' }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="loader-overlay" role="status" aria-live="polite">
      <div className="loader-card">
        <span className="loader-spinner" aria-hidden="true" />
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};
