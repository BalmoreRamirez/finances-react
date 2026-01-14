import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import { formatDateSV, parseDateYMDToSVMidnightUTC, todayYMDInSV } from '../../utils/dateTZ';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccounts } from '../../hooks/useAccounts';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { TransactionForm } from '../TransactionForm/TransactionForm';
import { TransactionList } from '../TransactionList/TransactionList';
import { ErrorBanner } from '../ErrorBanner/ErrorBanner';
import { Settings } from '../Settings/Settings';
import { Investments } from '../Investments/Investments';
import { Accounts } from '../Accounts/Accounts';
import './Dashboard.css';
import { useInvestments } from '../../hooks/useInvestments';
import { LoaderOverlay } from '../LoaderOverlay/LoaderOverlay.jsx';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, getBalance } = useTransactions();
  const { summarizeAccountBalances } = useAccounts();
  const { purchases, credits, loading: investmentsLoading } = useInvestments(user?.uid);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [firestoreError, setFirestoreError] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [analysisPeriod, setAnalysisPeriod] = useState('mes');
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
  const isDataSyncing = loading || investmentsLoading;
  const ledgerSummary = useMemo(() => summarizeAccountBalances({
    transactions,
    purchases,
    credits,
  }), [transactions, purchases, credits, summarizeAccountBalances]);

  const activeAccountBalance = useMemo(() => {
    const liquidIds = ['activos-banco', 'activos-caja', 'activos-fondo-inversiones'];
    const total = (ledgerSummary.accounts || [])
      .filter((account) => liquidIds.includes(account.id))
      .reduce((sum, account) => sum + (account.balance || 0), 0);
    return Math.max(0, total);
  }, [ledgerSummary.accounts]);

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

  const periodLabels = {
    dia: 'Hoy',
    semana: 'Últimos 7 días',
    mes: 'Últimos 30 días',
    'año': 'Últimos 12 meses'
  };

  const filteredPeriodTransactions = useMemo(() => {
    const todayYMD = todayYMDInSV();
    const startOfTodaySV = parseDateYMDToSVMidnightUTC(todayYMD);
    const startDate = new Date(startOfTodaySV);

    switch (analysisPeriod) {
      case 'dia':
        break;
      case 'semana':
        startDate.setUTCDate(startDate.getUTCDate() - 7);
        break;
      case 'mes':
        startDate.setUTCMonth(startDate.getUTCMonth() - 1);
        break;
      case 'año':
        startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
        break;
      default:
        startDate.setUTCMonth(startDate.getUTCMonth() - 1);
    }

    return transactions.filter((t) => new Date(t.date) >= startDate);
  }, [transactions, analysisPeriod]);

  const periodTotals = useMemo(() => {
    const income = filteredPeriodTransactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = filteredPeriodTransactions
      .filter((t) => t.type === 'egreso')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const balanceValue = income - expense;

    return {
      income,
      expense,
      balance: balanceValue,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0,
    };
  }, [filteredPeriodTransactions]);

  const periodTrendData = useMemo(() => {
    const dailyData = {};

    filteredPeriodTransactions.forEach((t) => {
      const label = formatDateSV(t.date, { month: 'short', day: 'numeric' });

      if (!dailyData[label]) {
        dailyData[label] = { date: label, ingresos: 0, egresos: 0 };
      }

      if (t.type === 'ingreso') {
        dailyData[label].ingresos += parseFloat(t.amount || 0);
      } else {
        dailyData[label].egresos += parseFloat(t.amount || 0);
      }
    });

    return Object.values(dailyData).slice(-10);
  }, [filteredPeriodTransactions]);

  const periodBarData = useMemo(() => ([{
    name: 'Período',
    Ingresos: periodTotals.income,
    Egresos: periodTotals.expense,
  }]), [periodTotals]);

  const categorySlices = useMemo(() => {
    const totalsByCategory = {};

    filteredPeriodTransactions.forEach((t) => {
      if (t.type !== 'egreso') return;
      totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + parseFloat(t.amount || 0);
    });

    return Object.entries(totalsByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [filteredPeriodTransactions]);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <Header 
              title="Dashboard unificado" 
              subtitle="Resumen y análisis integrados en una sola vista"
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

              <section className="analysis-section" aria-label="Análisis financiero integrado">
                <div className="analysis-header">
                  <div>
                    <p className="analysis-eyebrow">Análisis</p>
                    <h3>Salud financiera</h3>
                    <span className="analysis-helper">{periodLabels[analysisPeriod]}</span>
                  </div>
                  <div className="period-toggle" role="group" aria-label="Seleccionar período de análisis">
                    {['dia', 'semana', 'mes', 'año'].map((period) => (
                      <button
                        key={period}
                        type="button"
                        className={analysisPeriod === period ? 'active' : ''}
                        onClick={() => setAnalysisPeriod(period)}
                      >
                        {periodLabels[period]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="analysis-grid">
                  <div className="analysis-card income">
                    <div className="analysis-card-label">Ingresos</div>
                    <div className="analysis-card-value">{formatCurrency(periodTotals.income)}</div>
                    <span className="analysis-card-helper">Entrada total en el período</span>
                  </div>
                  <div className="analysis-card expense">
                    <div className="analysis-card-label">Egresos</div>
                    <div className="analysis-card-value">{formatCurrency(periodTotals.expense)}</div>
                    <span className="analysis-card-helper">Salidas registradas</span>
                  </div>
                  <div className={`analysis-card balance ${periodTotals.balance >= 0 ? 'positive' : 'negative'}`}>
                    <div className="analysis-card-label">Balance del período</div>
                    <div className="analysis-card-value">{formatCurrency(periodTotals.balance)}</div>
                    <span className="analysis-card-helper">{periodTotals.balance >= 0 ? 'Resultado favorable' : 'Revisa gastos'}</span>
                  </div>
                  <div className="analysis-card savings">
                    <div className="analysis-card-label">Tasa de ahorro</div>
                    <div className="analysis-card-value">{periodTotals.savingsRate.toFixed(1)}%</div>
                    <span className="analysis-card-helper">Ahorro sobre ingresos del período</span>
                  </div>
                </div>

                <div className="analysis-visuals">
                  <div className="chart-card">
                    <div className="chart-card-heading">
                      <h4>Tendencia del período</h4>
                      <span>Ingresos vs egresos</span>
                    </div>
                    {periodTrendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={periodTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={2} />
                          <Line type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="chart-empty">Aún no hay datos en este período.</div>
                    )}
                  </div>

                  <div className="chart-card">
                    <div className="chart-card-heading">
                      <h4>Ingresos vs egresos</h4>
                      <span>Distribución del período</span>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={periodBarData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="Ingresos" fill="#22c55e" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Egresos" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="category-chips">
                      {categorySlices.length > 0 ? categorySlices.map((cat) => {
                        const percentage = periodTotals.expense > 0
                          ? (cat.value / periodTotals.expense) * 100
                          : 0;
                        return (
                          <span key={cat.name} className="category-chip">
                            <strong>{cat.name}</strong> · {percentage.toFixed(1)}%
                          </span>
                        );
                      }) : <span className="category-chip muted">Sin gastos clasificados en el período</span>}
                    </div>
                  </div>
                </div>
              </section>
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
                  availableBalance={activeAccountBalance}
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

      case 'investments':
        return (
          <>
            <Header 
              title="Inversiones" 
              subtitle="Gestiona tus compras y créditos con seguimiento detallado"
            />
            <Investments transactions={transactions} />
          </>
        );

      case 'accounts':
        return (
          <>
            <Header 
              title="Cuentas contables" 
              subtitle="Valida cómo circula el dinero entre Activos, Pasivos, Patrimonio, Ingresos y Gastos"
            />
            <Accounts 
              transactions={transactions}
              transactionsLoading={loading}
            />
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
      <LoaderOverlay visible={isDataSyncing} message="Cargando movimientos y cuentas..." />
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
