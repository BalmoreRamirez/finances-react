import { useState, useMemo, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './AnalyticsDashboard.css';
import { formatDateSV, parseDateYMDToSVMidnightUTC, todayYMDInSV } from '../../utils/dateTZ';
import { useAuth } from '../../context/AuthContext';
import { useInvestments } from '../../hooks/useInvestments';
import { useAccounts } from '../../hooks/useAccounts';

export const AnalyticsDashboard = ({ transactions }) => {
  const [period, setPeriod] = useState('mes');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef(null);
  const { user } = useAuth();
  const { purchases, credits, loading: investmentsLoading } = useInvestments(user?.uid);
  const { summarizeAccountBalances } = useAccounts();

  const COLORS = {
    ingreso: '#48bb78',
    egreso: '#f56565',
    primary: '#4299e1',
    secondary: '#9f7aea'
  };

  // Filtrar transacciones por período
  const filteredTransactions = useMemo(() => {
    // Calcular inicio de período basado en TZ de El Salvador (medianoche)
    const todayYMD = todayYMDInSV();
    const startOfTodaySV = parseDateYMDToSVMidnightUTC(todayYMD);
    const startDate = new Date(startOfTodaySV);

    switch (period) {
      case 'dia':
        // ya está en inicio del día SV
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

    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, period]);

  // Calcular totales
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'ingreso')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'egreso')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income * 100) : 0
    };
  }, [filteredTransactions]);

  // Datos para gráfica de barras (Ingresos vs Egresos)
  const barChartData = useMemo(() => {
    return [{
      name: 'Total',
      Ingresos: totals.income,
      Egresos: totals.expense
    }];
  }, [totals]);

  // Datos para gráfica de pie (Distribución por categoría)
  const pieChartData = useMemo(() => {
    const categoryTotals = {};
    
    filteredTransactions.forEach(t => {
      if (t.type === 'egreso') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
      }
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Datos para gráfica de líneas (Tendencia temporal)
  const lineChartData = useMemo(() => {
    const dailyData = {};

    filteredTransactions.forEach(t => {
      const date = formatDateSV(t.date, { month: 'short', day: 'numeric' });

      if (!dailyData[date]) {
        dailyData[date] = { date, ingresos: 0, egresos: 0 };
      }
      
      if (t.type === 'ingreso') {
        dailyData[date].ingresos += parseFloat(t.amount);
      } else {
        dailyData[date].egresos += parseFloat(t.amount);
      }
    });

    return Object.values(dailyData).slice(-10);
  }, [filteredTransactions]);

  // Generar recomendaciones
  const recommendations = useMemo(() => {
    const recs = [];
    
    // Recomendación de ahorro
    if (totals.savingsRate < 20) {
      recs.push({
        icon: '💰',
        type: 'warning',
        title: 'Bajo índice de ahorro',
        message: `Tu tasa de ahorro es del ${totals.savingsRate.toFixed(1)}%. Se recomienda ahorrar al menos el 20% de tus ingresos.`
      });
    } else if (totals.savingsRate >= 20) {
      recs.push({
        icon: '✅',
        type: 'success',
        title: '¡Excelente ahorro!',
        message: `Tu tasa de ahorro es del ${totals.savingsRate.toFixed(1)}%. ¡Sigue así!`
      });
    }

    // Recomendación por categoría dominante
    if (pieChartData.length > 0) {
      const topCategory = pieChartData[0];
      const percentage = (topCategory.value / totals.expense * 100);
      
      if (percentage > 40) {
        recs.push({
          icon: '📊',
          type: 'info',
          title: `Alto gasto en ${topCategory.name}`,
          message: `El ${percentage.toFixed(1)}% de tus gastos son en ${topCategory.name}. Considera optimizar esta categoría.`
        });
      }
    }

    // Recomendación de balance
    if (totals.balance < 0) {
      recs.push({
        icon: '⚠️',
        type: 'danger',
        title: 'Balance negativo',
        message: 'Tus gastos superan tus ingresos. Revisa tus gastos y busca áreas donde puedas reducir.'
      });
    }

    // Recomendación de diversificación
    if (pieChartData.length > 0 && pieChartData.length < 3) {
      recs.push({
        icon: '📈',
        type: 'info',
        title: 'Diversifica tus gastos',
        message: 'Considera revisar si tus gastos están muy concentrados en pocas categorías.'
      });
    }

    // Recomendación positiva si no hay transacciones
    if (filteredTransactions.length === 0) {
      recs.push({
        icon: '📋',
        type: 'info',
        title: 'Sin datos para este período',
        message: 'No hay transacciones registradas en el período seleccionado.'
      });
    }

    return recs;
  }, [totals, pieChartData, filteredTransactions.length]);

  // Exportar a PDF
  const exportToPDF = async () => {
    setExporting(true);
    
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`reporte-financiero-${period}-${todayYMDInSV()}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const accountsSummary = useMemo(() => {
    return summarizeAccountBalances({
      transactions,
      purchases,
      credits,
    });
  }, [transactions, purchases, credits, summarizeAccountBalances]);

  const normalizedAccounts = useMemo(() => {
    if (!accountsSummary?.accounts) return [];
    return accountsSummary.accounts.filter((account) => !account.hidden);
  }, [accountsSummary]);

  const accountHighlights = useMemo(() => {
    return [...normalizedAccounts]
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 4);
  }, [normalizedAccounts]);

  const transactionInsights = useMemo(() => {
    const total = filteredTransactions.length;
    const volume = filteredTransactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
    const avg = total ? volume / total : 0;

    const largestIncome = filteredTransactions
      .filter(t => t.type === 'ingreso')
      .reduce((prev, current) => (prev && parseFloat(prev.amount) > parseFloat(current.amount) ? prev : current), null);

    const largestExpense = filteredTransactions
      .filter(t => t.type === 'egreso')
      .reduce((prev, current) => (prev && parseFloat(prev.amount) > parseFloat(current.amount) ? prev : current), null);

    const dominantCategory = pieChartData[0] || null;

    return {
      total,
      avg,
      largestIncome,
      largestExpense,
      dominantCategory,
    };
  }, [filteredTransactions, pieChartData]);

  const investmentOverview = useMemo(() => {
    const totalCapital = purchases.reduce((sum, purchase) => sum + (Number(purchase.investment) || 0), 0);
    const totalRecovered = purchases.reduce((sum, purchase) => sum + (Number(purchase.salePrice) || 0), 0);
    const profit = totalRecovered - totalCapital;
    const roi = totalCapital > 0 ? (profit / totalCapital) * 100 : 0;
    const activeCredits = credits.filter(credit => credit.status !== 'completed');
    const outstandingCredits = credits.reduce((sum, credit) => sum + (Number(credit.remainingBalance) || 0), 0);
    const totalCreditRecovered = credits.reduce((sum, credit) => sum + (Number(credit.totalPaid) || 0), 0);

    return {
      totalCapital,
      totalRecovered,
      profit,
      roi,
      activeCredits: activeCredits.length,
      outstandingCredits,
      totalCreditRecovered,
    };
  }, [purchases, credits]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const PIE_COLORS = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#4299e1', '#9f7aea', '#ed64a6'];

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2>📊 Dashboard de Análisis</h2>
          <p className="analytics-subtitle">Visualiza y analiza tus finanzas</p>
        </div>
        
        <button 
          onClick={exportToPDF}
          disabled={exporting}
          className="btn-export-pdf"
        >
          {exporting ? '📄 Generando...' : '📄 Exportar PDF'}
        </button>
      </div>

      <div className="period-selector">
        <button
          className={period === 'dia' ? 'active' : ''}
          onClick={() => setPeriod('dia')}
        >
          Hoy
        </button>
        <button
          className={period === 'semana' ? 'active' : ''}
          onClick={() => setPeriod('semana')}
        >
          Semana
        </button>
        <button
          className={period === 'mes' ? 'active' : ''}
          onClick={() => setPeriod('mes')}
        >
          Mes
        </button>
        <button
          className={period === 'año' ? 'active' : ''}
          onClick={() => setPeriod('año')}
        >
          Año
        </button>
      </div>

      <div ref={dashboardRef} className="analytics-content">
        {/* Tarjetas de resumen */}
        <div className="summary-cards">
          <div className="summary-card income">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Ingresos</h3>
              <p className="amount">{formatCurrency(totals.income)}</p>
            </div>
          </div>
          
          <div className="summary-card expense">
            <div className="card-icon">📉</div>
            <div className="card-content">
              <h3>Egresos</h3>
              <p className="amount">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
          
          <div className={`summary-card balance ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Balance</h3>
              <p className="amount">{formatCurrency(totals.balance)}</p>
            </div>
          </div>
          
          <div className="summary-card savings">
            <div className="card-icon">🎯</div>
            <div className="card-content">
              <h3>Tasa de Ahorro</h3>
              <p className="amount">{totals.savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Informe consolidado */}
        <div className="report-grid">
          <section className="report-card accounts-report">
            <header className="report-card-header">
              <div>
                <p className="report-eyebrow">Cuentas</p>
                <h3>Salud contable</h3>
              </div>
              <span className="report-tag">Neto {formatCurrency(accountsSummary?.totals?.net || 0)}</span>
            </header>
            <p className="report-description">
              Balancea tus activos, pasivos, patrimonio e inversiones en un vistazo.
            </p>
            <div className="accounts-highlight-grid">
              {accountHighlights.map(account => (
                <article key={account.id} className="account-highlight">
                  <div>
                    <p className="account-label">{account.label}</p>
                    <strong>{formatCurrency(account.balance)}</strong>
                  </div>
                  <small>
                    Entradas {formatCurrency(account.inflows)} · Salidas {formatCurrency(account.outflows)}
                  </small>
                </article>
              ))}
            </div>
            <footer className="report-footnote">
              Entradas totales {formatCurrency(accountsSummary?.totals?.debits || 0)} · Salidas totales {formatCurrency(accountsSummary?.totals?.credits || 0)}
            </footer>
          </section>

          <section className="report-card transactions-report">
            <header className="report-card-header">
              <div>
                <p className="report-eyebrow">Transacciones</p>
                <h3>Actividad reciente</h3>
              </div>
              <span className="report-tag">{transactionInsights.total} movimientos</span>
            </header>
            <p className="report-description">
              Detecta patrones rápidos sobre tus ingresos y egresos.
            </p>
            <ul className="insights-list">
              <li>
                <span>Ticket promedio</span>
                <strong>{formatCurrency(transactionInsights.avg)}</strong>
              </li>
              <li>
                <span>Mayor ingreso</span>
                <strong>
                  {transactionInsights.largestIncome
                    ? `${transactionInsights.largestIncome.description} · ${formatCurrency(transactionInsights.largestIncome.amount)}`
                    : '—'}
                </strong>
              </li>
              <li>
                <span>Mayor egreso</span>
                <strong>
                  {transactionInsights.largestExpense
                    ? `${transactionInsights.largestExpense.description} · ${formatCurrency(transactionInsights.largestExpense.amount)}`
                    : '—'}
                </strong>
              </li>
              <li>
                <span>Categoría dominante</span>
                <strong>
                  {transactionInsights.dominantCategory
                    ? `${transactionInsights.dominantCategory.name} (${((transactionInsights.dominantCategory.value / (totals.expense || 1)) * 100).toFixed(1)}%)`
                    : '—'}
                </strong>
              </li>
            </ul>
          </section>

          <section className="report-card investments-report">
            <header className="report-card-header">
              <div>
                <p className="report-eyebrow">Inversiones</p>
                <h3>Capital y créditos</h3>
              </div>
              <span className="report-tag">ROI {investmentOverview.roi.toFixed(1)}%</span>
            </header>
            {investmentsLoading ? (
              <div className="report-loading">Cargando datos de inversiones...</div>
            ) : (
              <div className="investment-grid">
                <div>
                  <p className="report-metric-label">Capital invertido</p>
                  <strong className="report-metric-value">{formatCurrency(investmentOverview.totalCapital)}</strong>
                  <small>Recuperado: {formatCurrency(investmentOverview.totalRecovered)}</small>
                </div>
                <div>
                  <p className="report-metric-label">Ganancia acumulada</p>
                  <strong className={`report-metric-value ${investmentOverview.profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(investmentOverview.profit)}
                  </strong>
                  <small>Créditos activos: {investmentOverview.activeCredits}</small>
                </div>
                <div>
                  <p className="report-metric-label">Créditos por cobrar</p>
                  <strong className="report-metric-value">{formatCurrency(investmentOverview.outstandingCredits)}</strong>
                  <small>Pagado: {formatCurrency(investmentOverview.totalCreditRecovered)}</small>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Gráficas */}
        <div className="charts-grid">
          {/* Gráfica de barras */}
          <div className="chart-container">
            <h3>Ingresos vs Egresos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="Ingresos" fill={COLORS.ingreso} />
                <Bar dataKey="Egresos" fill={COLORS.egreso} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de pie */}
          <div className="chart-container">
            <h3>Gastos por Categoría</h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>Sin gastos en este período</p>
              </div>
            )}
          </div>

          {/* Gráfica de líneas */}
          <div className="chart-container full-width">
            <h3>Tendencia Temporal</h3>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke={COLORS.ingreso} strokeWidth={2} />
                  <Line type="monotone" dataKey="egresos" stroke={COLORS.egreso} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>Sin datos para mostrar tendencia</p>
              </div>
            )}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="recommendations-section">
          <h3>💡 Recomendaciones Financieras</h3>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.type}`}>
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
