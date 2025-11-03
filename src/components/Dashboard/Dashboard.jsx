import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { TransactionForm } from '../TransactionForm/TransactionForm';
import { TransactionList } from '../TransactionList/TransactionList';
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
  // Sidebar manejado por Bootstrap Offcanvas

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
  const formatCurrency = (value) => new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const monthLabel = now.toLocaleDateString('es-ES', { month: 'long' });

  const transactionsThisMonth = transactions.filter(t => {
    const date = new Date(t.date);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const monthlyIncome = transactionsThisMonth
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyExpense = transactionsThisMonth
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalTransactions = transactions.length;
  const monthlyTransactionsCount = transactionsThisMonth.length;
  const incomeTransactions = transactions.filter(t => t.type === 'ingreso').length;
  const expenseTransactions = transactions.filter(t => t.type === 'egreso').length;
  const averageTicket = totalTransactions > 0
    ? transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) / totalTransactions
    : 0;
  const savingsRate = balance.income > 0
    ? ((balance.income - balance.expense) / balance.income) * 100
    : 0;

  const expenses = transactions.filter(t => t.type === 'egreso');
  const largestExpense = expenses.length > 0
    ? expenses.reduce((prev, current) => parseFloat(current.amount) > parseFloat(prev.amount) ? current : prev, expenses[0])
    : null;
  const largestExpenseAmount = largestExpense ? formatCurrency(parseFloat(largestExpense.amount)) : '—';
  const largestExpenseLabel = largestExpense ? largestExpense.description : 'Sin registros recientes';
  const savingsRateLabel = `${savingsRate > 0 ? '+' : ''}${savingsRate.toFixed(1)}%`;
  const savingsMessage = savingsRate >= 0 ? 'Mantienes un balance saludable' : 'Revisa tus gastos este mes';

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
              <div className="dashboard-hero">
                <div className="dashboard-hero-card">
                  <div className="dashboard-hero-header">
                    <span className="dashboard-hero-tag">Balance general</span>
                    <h2>Tu resumen financiero</h2>
                    <p>Actualizado el {formattedDate}</p>
                  </div>
                  <div className="dashboard-hero-balance">
                    <div>
                      <span className={`dashboard-hero-amount ${balance.total >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(balance.total)}
                      </span>
                      <span className="dashboard-hero-caption">Disponible en cuentas</span>
                    </div>
                    <div className="dashboard-hero-meta">
                      <span>Ingresos acumulados: <strong>{formatCurrency(balance.income)}</strong></span>
                      <span>Egresos acumulados: <strong>{formatCurrency(balance.expense)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-hero-side">
                  <div className="hero-side-card income">
                    <div className="hero-side-info">
                      <span className="hero-side-label">Ingresos del mes</span>
                      <span className="hero-side-amount">{formatCurrency(monthlyIncome)}</span>
                      <span className="hero-side-helper">{`En ${monthLabel}`}</span>
                    </div>
                    <span className="hero-side-icon" aria-hidden="true">📈</span>
                  </div>
                  <div className="hero-side-card expense">
                    <div className="hero-side-info">
                      <span className="hero-side-label">Egresos del mes</span>
                      <span className="hero-side-amount">{formatCurrency(monthlyExpense)}</span>
                      <span className="hero-side-helper">{monthlyExpense > monthlyIncome ? 'Revisa tus gastos' : 'Control saludable'}</span>
                    </div>
                    <span className="hero-side-icon" aria-hidden="true">📉</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-secondary-grid">
                <div className="stat-card">
                  <div className="stat-icon purple" aria-hidden="true">�</div>
                  <div className="stat-details">
                    <span className="stat-label">Total transacciones</span>
                    <span className="stat-value">{totalTransactions}</span>
                    <span className="stat-helper">Este mes: {monthlyTransactionsCount}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon amber" aria-hidden="true">�</div>
                  <div className="stat-details">
                    <span className="stat-label">Ticket promedio</span>
                    <span className="stat-value">{formatCurrency(averageTicket)}</span>
                    <span className="stat-helper">Ingresos: {incomeTransactions} · Egresos: {expenseTransactions}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon emerald" aria-hidden="true">🌱</div>
                  <div className="stat-details">
                    <span className="stat-label">Índice de ahorro</span>
                    <span className="stat-value">{savingsRateLabel}</span>
                    <span className="stat-helper">{savingsMessage}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon rose" aria-hidden="true">📉</div>
                  <div className="stat-details">
                    <span className="stat-label">Mayor egreso</span>
                    <span className="stat-value">{largestExpenseAmount}</span>
                    <span className="stat-helper">{largestExpenseLabel}</span>
                  </div>
                </div>
              </div>

              <div className="recent-section">
                <div className="section-heading">
                  <div>
                    <h3>Transacciones recientes</h3>
                    <p>Movimiento de los últimos días</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleViewChange('transactions')}
                  >
                    Ver todas
                  </button>
                </div>
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
                className="btn btn-primary"
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
      
      {/* Navbar superior con toggler para Offcanvas */}
      <nav className="navbar navbar-light bg-light sticky-top d-lg-none px-3 w-100 mobile-navbar position-relative">
        <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#appSidebar" aria-controls="appSidebar" aria-label="Abrir menú">
          <span className="navbar-toggler-icon"></span>
        </button>
        <span className="navbar-brand mb-0 h1">FinanceApp</span>
      </nav>

      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        userEmail={user?.email}
      />

      <main className="main-content with-sidebar">
  <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
