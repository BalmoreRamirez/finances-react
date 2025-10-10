import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionForm } from '../TransactionForm/TransactionForm';
import { TransactionList } from '../TransactionList/TransactionList';
import { Balance } from '../Balance/Balance';
import { ErrorBanner } from '../ErrorBanner/ErrorBanner';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { transactions, loading, addTransaction, deleteTransaction, getBalance } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [firestoreError, setFirestoreError] = useState(false);

  useEffect(() => {
    // Detectar error de Firestore después de 3 segundos si no hay transacciones
    const timer = setTimeout(() => {
      if (!loading && transactions.length === 0 && user && !firestoreError) {
        // Solo mostrar si realmente hay un problema
        // Si el usuario simplemente no tiene transacciones, no mostrar error
      }
    }, 3000);

    // Ocultar banner si hay transacciones (significa que funciona)
    if (transactions.length > 0) {
      setShowErrorBanner(false);
    }

    return () => clearTimeout(timer);
  }, [loading, transactions, user, firestoreError]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleAddTransaction = async (transaction) => {
    const result = await addTransaction(transaction);
    
    if (!result.success && result.error.includes('Firestore')) {
      setFirestoreError(true);
      setShowErrorBanner(true);
    }
    
    return result;
  };

  const balance = getBalance();

  return (
    <div className="dashboard">
      {showErrorBanner && <ErrorBanner onDismiss={() => setShowErrorBanner(false)} />}
      
      <header className="dashboard-header" style={{ marginTop: showErrorBanner ? '180px' : '0' }}>
        <h1>💰 Finanzas Personales</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <Balance balance={balance} />

        <div className="actions">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn-add-transaction"
          >
            {showForm ? '✕ Cancelar' : '+ Nueva Transacción'}
          </button>
        </div>

        {showForm && (
          <TransactionForm 
            onAddTransaction={handleAddTransaction}
            onClose={() => setShowForm(false)}
          />
        )}

        <TransactionList 
          transactions={transactions}
          loading={loading}
          onDeleteTransaction={deleteTransaction}
        />
      </div>
    </div>
  );
};
