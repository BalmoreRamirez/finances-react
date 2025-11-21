import { useState, useEffect, useMemo } from 'react';
import './TransactionForm.css';
import { todayYMDInSV } from '../../utils/dateTZ';
import { useAccounts } from '../../hooks/useAccounts';
import { TRANSACTION_ACCOUNT_DEFAULTS } from '../../services/accounts';

export const TransactionForm = ({ onAddTransaction, onUpdateTransaction, onClose, editingTransaction }) => {
  const { getAllowedAccounts, validateAccountFlow, getAccountById } = useAccounts();
  const defaultFlow = TRANSACTION_ACCOUNT_DEFAULTS.egreso;

  const [formData, setFormData] = useState({
    type: 'egreso',
    description: '',
    amount: '',
    category: '',
    date: todayYMDInSV(),
    fromAccountId: defaultFlow.from,
    toAccountId: defaultFlow.to,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flowError, setFlowError] = useState('');

  // Cargar datos de la transacción al editar
  useEffect(() => {
    if (editingTransaction) {
      const fallback = TRANSACTION_ACCOUNT_DEFAULTS[editingTransaction.type] || {};
      setFormData({
        type: editingTransaction.type,
        description: editingTransaction.description,
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        date: editingTransaction.date.split('T')[0],
        fromAccountId: editingTransaction.fromAccountId || fallback.from || '',
        toAccountId: editingTransaction.toAccountId || fallback.to || '',
      });
      setFlowError('');
      setError('');
    }
  }, [editingTransaction]);

  const categories = {
    ingreso: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otros'],
    egreso: ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros']
  };

  const allowedFromAccounts = useMemo(
    () => getAllowedAccounts(formData.type, 'from'),
    [formData.type, getAllowedAccounts]
  );

  const allowedToAccounts = useMemo(
    () => getAllowedAccounts(formData.type, 'to'),
    [formData.type, getAllowedAccounts]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextState = {
        ...prev,
        [name]: value,
      };

      if (name === 'type') {
        const defaults = TRANSACTION_ACCOUNT_DEFAULTS[value] || {};
        nextState.category = '';
        nextState.fromAccountId = defaults.from || '';
        nextState.toAccountId = defaults.to || '';
      }

      return nextState;
    });
    setError(''); // Limpiar error al cambiar campos
    setFlowError('');
  };

  useEffect(() => {
    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      setFlowError('');
      return;
    }

    const validation = validateAccountFlow({
      movementType: formData.type,
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      amount: formData.amount,
    });
    setFlowError(validation.valid ? '' : validation.message);
  }, [formData.type, formData.fromAccountId, formData.toAccountId, formData.amount, validateAccountFlow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validation = validateAccountFlow({
      movementType: formData.type,
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      amount: formData.amount,
    });

    if (!validation.valid) {
      setFlowError(validation.message);
      setLoading(false);
      return;
    }

    const fromAccount = getAccountById(formData.fromAccountId);
    const toAccount = getAccountById(formData.toAccountId);

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      fromAccountName: fromAccount?.label || null,
      toAccountName: toAccount?.label || null,
      fromAccountCategory: fromAccount?.categoryKey || null,
      toAccountCategory: toAccount?.categoryKey || null,
    };

    let result;
    if (editingTransaction) {
      result = await onUpdateTransaction(editingTransaction.id, transactionData);
    } else {
      result = await onAddTransaction(transactionData);
    }

    setLoading(false);

    if (result.success) {
      setFormData({
        type: 'egreso',
        description: '',
        amount: '',
        category: '',
        date: todayYMDInSV(),
        fromAccountId: TRANSACTION_ACCOUNT_DEFAULTS.egreso.from,
        toAccountId: TRANSACTION_ACCOUNT_DEFAULTS.egreso.to,
      });
      setFlowError('');
      onClose();
    } else {
      setError(result.error || 'Error al guardar la transacción');
    }
  };

  return (
    <div className="transaction-form">
      <h3>{editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}</h3>

      {(error || flowError) && (
        <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
          <span>⚠️</span>
          <div>{error || flowError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="egreso">Egreso (Gasto)</option>
              <option value="ingreso">Ingreso (Ganancia)</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Fecha</label>
            <input
              className="form-control"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
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

          <div className="col-md-6">
            <label className="form-label">Monto</label>
            <input
              className="form-control"
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

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label className="form-label">Cuenta de origen</label>
            <select
              className="form-select"
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar cuenta de origen</option>
              {allowedFromAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.label} — {account.description}
                </option>
              ))}
            </select>
            <small className="text-muted">Desde dónde sale el dinero</small>
          </div>

          <div className="col-md-6">
            <label className="form-label">Cuenta de destino</label>
            <select
              className="form-select"
              name="toAccountId"
              value={formData.toAccountId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar cuenta de destino</option>
              {allowedToAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.label} — {account.description}
                </option>
              ))}
            </select>
            <small className="text-muted">Hacia dónde llega el dinero</small>
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label">Descripción</label>
          <input
            className="form-control"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Ej: Compra de supermercado"
          />
        </div>

        <div className="d-flex gap-2 mt-4">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : editingTransaction ? 'Actualizar Transacción' : 'Guardar Transacción'}
          </button>
          <button type="button" onClick={onClose} className="btn btn-outline-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
