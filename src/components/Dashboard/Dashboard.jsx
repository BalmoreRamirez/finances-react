import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { TransactionForm } from '../TransactionForm/TransactionForm';
import { TransactionList } from '../TransactionList/TransactionList';
import { Balance } from '../Balance/Balance';
import { ErrorBanner } from '../ErrorBanner/ErrorBanner';
import { AnalyticsDashboard } from '../AnalyticsDashboard/AnalyticsDashboard';
import { Settings } from '../Settings/Settings';
import { Investments } from '../Investments/Investments';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, getBalance } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [firestoreError, setFirestoreError] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'transactions', 'analytics', 'settings'

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

  const handleUpdateTransaction = async (id, transaction) => {
    const result = await updateTransaction(id, transaction);
    
    if (!result.success && result.error.includes('Firestore')) {
      setFirestoreError(true);
      setShowErrorBanner(true);
    }
    
    return result;
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setShowForm(false);
    setEditingTransaction(null);
  };

  const balance = getBalance();

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <Header 
              title="Dashboard" 
              subtitle="Resumen general de tus finanzas"
            />
            <div className="dashboard-grid">
              <Balance balance={balance} />
              
              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon">💳</div>
                  <div className="stat-info">
                    <span className="stat-label">Total Transacciones</span>
                    <span className="stat-value">{transactions.length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <span className="stat-label">Este Mes</span>
                    <span className="stat-value">{transactions.filter(t => {
                      const date = new Date(t.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}</span>
                  </div>
                </div>
              </div>

              <div className="recent-section">
                <h3>Transacciones Recientes</h3>
                <TransactionList 
                  transactions={transactions.slice(0, 5)}
                  loading={loading}
                  onDeleteTransaction={deleteTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              </div>
            </div>
          </>
        );

      case 'transactions':
        return (
          <>
            <Header 
              title="Transacciones" 
              subtitle="Gestiona todas tus transacciones en un solo lugar"
            >
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="btn-primary"
              >
                {showForm ? '✕ Cancelar' : '+ Nueva Transacción'}
              </button>
            </Header>

            {showForm && (
              <div className="form-section">
                <TransactionForm 
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onClose={handleCloseForm}
                  editingTransaction={editingTransaction}
                />
              </div>
            )}

            <TransactionList 
              transactions={transactions}
              loading={loading}
              onDeleteTransaction={deleteTransaction}
              onEditTransaction={handleEditTransaction}
            />
          </>
        );

      case 'analytics':
        return (
          <>
            <Header 
              title="Análisis Financiero" 
              subtitle="Visualiza y analiza tus finanzas con gráficas detalladas"
            />
            <AnalyticsDashboard transactions={transactions} />
          </>
        );

      case 'investments':
        return (
          <>
            <Header 
              title="Inversiones" 
              subtitle="Gestiona tus compras y créditos con seguimiento detallado"
            />
            <Investments />
          </>
        );

      case 'settings':
        return (
          <>
            <Header 
              title="Configuración" 
              subtitle="Personaliza tu experiencia y gestiona categorías"
            />
            <Settings />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      {showErrorBanner && <ErrorBanner onDismiss={() => setShowErrorBanner(false)} />}
      
      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        userEmail={user?.email}
      />

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};
