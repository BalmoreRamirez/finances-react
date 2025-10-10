import './ErrorBanner.css';

export const ErrorBanner = ({ onDismiss }) => {
  return (
    <div className="error-banner">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <h3>Firestore no está configurado</h3>
          <p>
            Para usar la aplicación, necesitas configurar Firestore en Firebase Console.
            Esto tomará solo 5 minutos.
          </p>
          <div className="error-links">
            <a 
              href="https://console.firebase.google.com/project/financesapp-4d454/firestore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-config"
            >
              🔧 Ir a Firestore Console
            </a>
            <button onClick={() => window.location.reload()} className="btn-reload">
              🔄 Recargar después de configurar
            </button>
          </div>
          <details className="error-details">
            <summary>📖 Ver pasos rápidos</summary>
            <ol>
              <li>Click en "Crear base de datos" en Firestore</li>
              <li>Selecciona "Modo de producción"</li>
              <li>Ve a la pestaña "Reglas"</li>
              <li>Copia las reglas del archivo <code>FIREBASE_SETUP.md</code></li>
              <li>Publica las reglas</li>
              <li>Recarga esta página</li>
            </ol>
          </details>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="error-close">✕</button>
        )}
      </div>
    </div>
  );
};
