import './TransactionList.css';

export const TransactionList = ({ transactions, loading, onDeleteTransaction }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      await onDeleteTransaction(id);
    }
  };

  if (loading) {
    return (
      <div className="transaction-list">
        <h2>Historial de Transacciones</h2>
        <div className="loading">Cargando transacciones...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list">
        <h2>Historial de Transacciones</h2>
        <div className="empty-state">
          <p>📋 No hay transacciones registradas</p>
          <p className="empty-subtitle">Comienza agregando tu primera transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h2>Historial de Transacciones</h2>
      <div className="transactions">
        {transactions.map(transaction => (
          <div 
            key={transaction.id} 
            className={`transaction-item ${transaction.type}`}
          >
            <div className="transaction-icon">
              {transaction.type === 'ingreso' ? '📈' : '📉'}
            </div>
            <div className="transaction-details">
              <div className="transaction-header">
                <h4>{transaction.description}</h4>
                <span className={`amount ${transaction.type}`}>
                  {transaction.type === 'ingreso' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="transaction-meta">
                <span className="category">{transaction.category}</span>
                <span className="date">{formatDate(transaction.date)}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(transaction.id)}
              className="btn-delete"
              title="Eliminar transacción"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
