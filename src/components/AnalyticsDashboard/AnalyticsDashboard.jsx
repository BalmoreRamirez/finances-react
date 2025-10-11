import { useState, useMemo, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './AnalyticsDashboard.css';

export const AnalyticsDashboard = ({ transactions }) => {
  const [period, setPeriod] = useState('mes');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef(null);

  const COLORS = {
    ingreso: '#48bb78',
    egreso: '#f56565',
    primary: '#4299e1',
    secondary: '#9f7aea'
  };

  // Filtrar transacciones por período
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'dia':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'mes':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'año':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
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
      const date = new Date(t.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dailyData[date]) {
        dailyData[date] = { date, ingresos: 0, egresos: 0 };
      }
      
      if (t.type === 'ingreso') {
        dailyData[date].ingresos += parseFloat(t.amount);
      } else {
        dailyData[date].egresos += parseFloat(t.amount);
      }
    });

    return Object.values(dailyData).slice(-10); // Últimos 10 días/puntos
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
      pdf.save(`reporte-financiero-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
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
