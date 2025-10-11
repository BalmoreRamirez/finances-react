import { useState } from 'react';
import './TransactionList.css';

export const TransactionList = ({ transactions, loading, onDeleteTransaction, onEditTransaction }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

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

  // Filtrar transacciones por búsqueda
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-container">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No hay transacciones registradas</h3>
          <p>Comienza agregando tu primera transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      {/* Controles superiores */}
      <div className="list-controls">
        <div className="view-mode-selector">
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de tabla"
          >
            <span>📋</span> Lista
          </button>
          <button
            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Vista de tarjetas"
          >
            <span>🃏</span> Tarjetas
          </button>
        </div>

        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar transacción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-btn-container">
          <button className="filter-btn" title="Filtros">
            🎯 Filtros
          </button>
        </div>
      </div>

      {/* Vista de tabla */}
      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map(transaction => (
                <tr key={transaction.id} className="table-row">
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <div className="description-cell">
                      <span className="transaction-icon">
                        {transaction.type === 'ingreso' ? '📈' : '📉'}
                      </span>
                      <span className="description-text">{transaction.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${transaction.type}`}>
                      {transaction.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td>
                    <span className="category-badge">{transaction.category}</span>
                  </td>
                  <td className="date-cell">{formatDate(transaction.date)}</td>
                  <td>
                    <span className={`amount ${transaction.type}`}>
                      {transaction.type === 'ingreso' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge active">Activa</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEditTransaction(transaction)}
                        className="action-btn edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="action-btn delete"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                      <button className="action-btn more" title="Más opciones">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vista de tarjetas */
        <div className="cards-container">
          {currentTransactions.map(transaction => (
            <div key={transaction.id} className={`transaction-card ${transaction.type}`}>
              <div className="card-header">
                <div className="card-icon">
                  {transaction.type === 'ingreso' ? '📈' : '📉'}
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => onEditTransaction(transaction)}
                    className="action-btn edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="action-btn delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h4 className="card-description">{transaction.description}</h4>
              <div className="card-meta">
                <span className="category-badge">{transaction.category}</span>
                <span className="date-text">{formatDate(transaction.date)}</span>
              </div>
              <div className="card-amount">
                <span className={`amount ${transaction.type}`}>
                  {transaction.type === 'ingreso' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          
          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="pagination-dots">...</span>;
              }
              return null;
            })}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
