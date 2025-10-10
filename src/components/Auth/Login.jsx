import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export const Login = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Iniciar Sesión</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p className="toggle-auth">
        ¿No tienes cuenta? <button onClick={onToggle}>Regístrate</button>
      </p>
    </div>
  );
};
