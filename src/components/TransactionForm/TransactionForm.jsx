import { useState } from 'react';
import './TransactionForm.css';

export const TransactionForm = ({ onAddTransaction, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'egreso',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = {
    ingreso: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otros'],
    egreso: ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && { category: '' })
    }));
    setError(''); // Limpiar error al cambiar campos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onAddTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    setLoading(false);

    if (result.success) {
      setFormData({
        type: 'egreso',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      onClose();
    } else {
      setError(result.error || 'Error al guardar la transacción');
    }
  };

  return (
    <div className="transaction-form">
      <h3>Nueva Transacción</h3>
      
      {error && (
        <div className="form-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="egreso">Egreso (Gasto)</option>
              <option value="ingreso">Ingreso (Ganancia)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoría</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories[formData.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Monto</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Ej: Compra de supermercado"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Guardando...' : 'Guardar Transacción'}
          </button>
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
