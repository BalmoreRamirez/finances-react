import React, { useState, useEffect, useRef } from 'react';
import { useInvestments } from '../../hooks/useInvestments';
import { useAuth } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import './Investments.css';

export const Investments = () => {
  const { user } = useAuth();
  const {
    purchases,
    credits,
    loading,
    addPurchase,
    updatePurchase,
    deletePurchase,
    addCredit,
    updateCredit,
    deleteCredit,
    addPayment,
    deletePayment
  } = useInvestments(user?.uid);

  // Referencia para el reporte
  const reportRef = useRef(null);

  const [activeTab, setActiveTab] = useState('purchases'); // purchases, credits
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // purchase, credit, payments
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCredit, setSelectedCredit] = useState(null);

  // Estados para sub-tabs de créditos
  const [creditSubTab, setCreditSubTab] = useState('active'); // active, completed

  // Estado para mostrar modal de reporte
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Estados para paginación
  const [currentPagePurchases, setCurrentPagePurchases] = useState(1);
  const [currentPageCredits, setCurrentPageCredits] = useState(1);
  const itemsPerPage = 10;

  // Estado para agregar pago
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Estado para formulario de compras
  const [purchaseForm, setPurchaseForm] = useState({
    productName: '',
    investment: '',
    salePrice: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Estado para formulario de créditos
  const [creditForm, setCreditForm] = useState({
    clientName: '',
    principalAmount: '',
    interestRate: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Efecto para actualizar el crédito seleccionado cuando cambian los créditos
  useEffect(() => {
    if (selectedCredit && credits.length > 0) {
      const updatedCredit = credits.find(c => c.id === selectedCredit.id);
      if (updatedCredit) {
        setSelectedCredit(updatedCredit);
      }
    }
  }, [credits]);

  // Resetear página al cambiar de sub-tab de créditos
  useEffect(() => {
    setCurrentPageCredits(1);
  }, [creditSubTab]);

  // Calcular ganancia y ROI de compra
  const calculatePurchaseMetrics = () => {
    const investment = parseFloat(purchaseForm.investment) || 0;
    const salePrice = parseFloat(purchaseForm.salePrice) || 0;
    const profit = salePrice - investment;
    const roi = investment > 0 ? ((profit / investment) * 100).toFixed(2) : 0;
    return { profit, roi };
  };

  // Calcular totales de crédito
  const calculateCreditMetrics = () => {
    const principal = parseFloat(creditForm.principalAmount) || 0;
    const rate = parseFloat(creditForm.interestRate) || 0;
    const interest = (principal * rate) / 100;
    const totalAmount = principal + interest;
    return { interest, totalAmount };
  };

  // Handlers para compras
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    const investment = parseFloat(purchaseForm.investment);
    const salePrice = parseFloat(purchaseForm.salePrice);

    if (!purchaseForm.productName || investment <= 0 || salePrice <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const purchaseData = {
      productName: purchaseForm.productName,
      investment,
      salePrice,
      date: new Date(purchaseForm.date),
      description: purchaseForm.description
    };

    let result;
    if (editingItem) {
      result = await updatePurchase(editingItem.id, purchaseData);
    } else {
      result = await addPurchase(purchaseData);
    }

    if (result.success) {
      resetPurchaseForm();
      setShowModal(false);
      setEditingItem(null);
    } else {
      alert('Error al guardar la compra: ' + result.error);
    }
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      productName: '',
      investment: '',
      salePrice: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleEditPurchase = (purchase) => {
    setEditingItem(purchase);
    setPurchaseForm({
      productName: purchase.productName,
      investment: purchase.investment.toString(),
      salePrice: purchase.salePrice.toString(),
      date: purchase.date.toISOString().split('T')[0],
      description: purchase.description || ''
    });
    setModalType('purchase');
    setShowModal(true);
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (window.confirm('¿Estás seguro de eliminar esta compra?')) {
      const result = await deletePurchase(purchaseId);
      if (!result.success) {
        alert('Error al eliminar: ' + result.error);
      }
    }
  };

  // Handlers para créditos
  const handleCreditSubmit = async (e) => {
    e.preventDefault();
    const principal = parseFloat(creditForm.principalAmount);
    const rate = parseFloat(creditForm.interestRate);

    if (!creditForm.clientName || principal <= 0 || rate < 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const { interest, totalAmount } = calculateCreditMetrics();
    const creditData = {
      clientName: creditForm.clientName,
      principalAmount: principal,
      interestRate: rate,
      interestAmount: interest,
      totalAmount,
      date: new Date(creditForm.date),
      description: creditForm.description
    };

    let result;
    if (editingItem) {
      result = await updateCredit(editingItem.id, creditData);
    } else {
      result = await addCredit(creditData);
    }

    if (result.success) {
      resetCreditForm();
      setShowModal(false);
      setEditingItem(null);
    } else {
      alert('Error al guardar el crédito: ' + result.error);
    }
  };

  const resetCreditForm = () => {
    setCreditForm({
      clientName: '',
      principalAmount: '',
      interestRate: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleEditCredit = (credit) => {
    setEditingItem(credit);
    setCreditForm({
      clientName: credit.clientName,
      principalAmount: credit.principalAmount.toString(),
      interestRate: credit.interestRate.toString(),
      date: credit.date.toISOString().split('T')[0],
      description: credit.description || ''
    });
    setModalType('credit');
    setShowModal(true);
  };

  const handleDeleteCredit = async (creditId) => {
    if (window.confirm('¿Estás seguro de eliminar este crédito?')) {
      const result = await deleteCredit(creditId);
      if (!result.success) {
        alert('Error al eliminar: ' + result.error);
      }
    }
  };

  const handleViewInstallments = (credit) => {
    setSelectedCredit(credit);
    setModalType('payments');
    setShowModal(true);
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Handlers para pagos
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);

    if (!amount || amount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    const result = await addPayment(
      selectedCredit.id,
      amount,
      new Date(paymentForm.date),
      paymentForm.notes
    );

    if (result.success) {
      setPaymentForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      // El useEffect se encargará de actualizar selectedCredit automáticamente
    } else {
      alert('Error al registrar pago: ' + result.error);
    }
  };

  const handleDeletePayment = async (paymentIndex) => {
    if (!window.confirm('¿Estás seguro de eliminar este pago?')) return;

    const result = await deletePayment(selectedCredit.id, paymentIndex);

    if (!result.success) {
      alert('Error al eliminar pago: ' + result.error);
    }
    // El useEffect se encargará de actualizar selectedCredit automáticamente
  };

  const openNewModal = (type) => {
    setEditingItem(null);
    setModalType(type);
    setShowModal(true);
    if (type === 'purchase') {
      resetPurchaseForm();
    } else {
      resetCreditForm();
    }
  };

  // Función para exportar reporte de créditos a JPG
  const exportCreditsReport = async () => {
    try {
      setGeneratingReport(true);
      setShowReportModal(true);

      // Esperar a que el modal se renderice
      await new Promise(resolve => setTimeout(resolve, 100));

      if (reportRef.current) {
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true
        });

        // Convertir canvas a imagen JPG
        const image = canvas.toDataURL('image/jpeg', 1.0);
        
        // Crear link de descarga
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `reporte-creditos-${date}.jpg`;
        link.href = image;
        link.click();

        // Cerrar modal después de descargar
        setTimeout(() => {
          setShowReportModal(false);
          setGeneratingReport(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
      setShowReportModal(false);
      setGeneratingReport(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setSelectedCredit(null);
    resetPurchaseForm();
    resetCreditForm();
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Ordenar y paginar compras (más recientes primero)
  const sortedPurchases = [...purchases].sort((a, b) => b.date - a.date);
  const totalPagesPurchases = Math.ceil(sortedPurchases.length / itemsPerPage);
  const paginatedPurchases = sortedPurchases.slice(
    (currentPagePurchases - 1) * itemsPerPage,
    currentPagePurchases * itemsPerPage
  );

  // Ordenar y paginar créditos (más recientes primero)
  const sortedCredits = [...credits].sort((a, b) => b.date - a.date);
  
  // Filtrar créditos por sub-tab
  const filteredCredits = creditSubTab === 'active' 
    ? sortedCredits.filter(c => c.status === 'active')
    : sortedCredits.filter(c => c.status === 'completed');
  
  const totalPagesCredits = Math.ceil(filteredCredits.length / itemsPerPage);
  const paginatedCredits = filteredCredits.slice(
    (currentPageCredits - 1) * itemsPerPage,
    currentPageCredits * itemsPerPage
  );

  // Calcular resúmenes
  const purchasesSummary = {
    totalInvestment: purchases.reduce((sum, p) => sum + p.investment, 0),
    totalRevenue: purchases.reduce((sum, p) => sum + p.salePrice, 0),
    totalProfit: purchases.reduce((sum, p) => sum + p.profit, 0)
  };

  const creditsSummary = {
    totalCapital: credits.reduce((sum, c) => sum + c.principalAmount, 0),
    totalRecovered: credits.reduce((sum, c) => sum + (c.totalPaid || 0), 0),
    totalPending: credits.reduce((sum, c) => sum + (c.remainingBalance || c.totalAmount), 0),
    // Ganancias acumuladas = Total pagado - Capital prestado (solo de créditos completados o parcialmente pagados)
    totalProfitAccumulated: credits.reduce((sum, c) => {
      const paid = c.totalPaid || 0;
      const profit = paid - c.principalAmount;
      return sum + (profit > 0 ? profit : 0);
    }, 0)
  };

  if (loading) {
    return <div className="investments-loading">Cargando inversiones...</div>;
  }

  return (
    <div className="investments-container">
      {/* Header con tabs */}
      <div className="investments-header">
        <div className="investments-tabs">
          <button
            className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <span className="tab-icon">🛒</span>
            <span className="tab-label">Compras</span>
            <span className="tab-count">{purchases.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            <span className="tab-icon">💳</span>
            <span className="tab-label">Créditos</span>
            <span className="tab-count">{credits.length}</span>
          </button>
        </div>

        <button
          className="btn-new-investment"
          onClick={() => openNewModal(activeTab === 'purchases' ? 'purchase' : 'credit')}
        >
          <span>➕</span>
          <span>{activeTab === 'purchases' ? 'Nueva Compra' : 'Nuevo Crédito'}</span>
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'purchases' && (
        <div className="purchases-tab">
          {/* Resumen de compras */}
          <div className="investments-summary">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <div className="summary-label">Inversión Total</div>
                <div className="summary-value">${purchasesSummary.totalInvestment.toFixed(2)}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">💵</div>
              <div className="summary-content">
                <div className="summary-label">Ingresos Totales</div>
                <div className="summary-value">${purchasesSummary.totalRevenue.toFixed(2)}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-content">
                <div className="summary-label">Ganancia Total</div>
                <div className="summary-value success">${purchasesSummary.totalProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Tabla de compras */}
          <div className="purchases-table-container">
            {purchases.length > 0 ? (
              <>
              <table className="purchases-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Inversión</th>
                    <th>Precio Venta</th>
                    <th>Ganancia</th>
                    <th>ROI</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPurchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td>{purchase.date.toLocaleDateString()}</td>
                      <td>
                        <div className="product-cell">
                          <span className="product-name">{purchase.productName}</span>
                          {purchase.description && (
                            <span className="product-desc">{purchase.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="amount-cell">${purchase.investment.toFixed(2)}</td>
                      <td className="amount-cell">${purchase.salePrice.toFixed(2)}</td>
                      <td className={`amount-cell ${purchase.profit >= 0 ? 'success' : 'error'}`}>
                        ${purchase.profit.toFixed(2)}
                      </td>
                      <td className={`roi-cell ${purchase.roi >= 0 ? 'positive' : 'negative'}`}>
                        {purchase.roi.toFixed(2)}%
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-icon edit"
                          onClick={() => handleEditPurchase(purchase)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeletePurchase(purchase.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Paginación Compras */}
              {totalPagesPurchases > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPagePurchases(prev => Math.max(1, prev - 1))}
                    disabled={currentPagePurchases === 1}
                  >
                    ← Anterior
                  </button>
                  <span className="pagination-info">
                    Página {currentPagePurchases} de {totalPagesPurchases}
                    <span className="pagination-count">({purchases.length} compras)</span>
                  </span>
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPagePurchases(prev => Math.min(totalPagesPurchases, prev + 1))}
                    disabled={currentPagePurchases === totalPagesPurchases}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <p>No hay compras registradas</p>
                <button 
                  className="btn-primary"
                  onClick={() => openNewModal('purchase')}
                >
                  Registrar Primera Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'credits' && (
        <div className="credits-tab">
          {/* Resumen de créditos */}
          <div className="investments-summary">
            <div className="summary-card">
              <div className="summary-icon">💼</div>
              <div className="summary-content">
                <div className="summary-label">Capital Prestado</div>
                <div className="summary-value">${creditsSummary.totalCapital.toFixed(2)}</div>
                <div className="summary-hint">Total invertido en créditos</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">💵</div>
              <div className="summary-content">
                <div className="summary-label">Capital Recuperado</div>
                <div className="summary-value success">${creditsSummary.totalRecovered.toFixed(2)}</div>
                <div className="summary-hint">Dinero recibido de pagos</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <div className="summary-label">Ganancias Acumuladas</div>
                <div className="summary-value profit">${creditsSummary.totalProfitAccumulated.toFixed(2)}</div>
                <div className="summary-hint">Intereses ya cobrados</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⏳</div>
              <div className="summary-content">
                <div className="summary-label">Pendiente de Cobro</div>
                <div className="summary-value warning">${creditsSummary.totalPending.toFixed(2)}</div>
                <div className="summary-hint">Capital + intereses por cobrar</div>
              </div>
            </div>
          </div>

          {/* Sub-tabs para créditos */}
          <div className="credits-sub-tabs">
            <div className="sub-tabs-left">
              <button
                className={`sub-tab-btn ${creditSubTab === 'active' ? 'active' : ''}`}
                onClick={() => setCreditSubTab('active')}
              >
                <span className="sub-tab-icon">⏳</span>
                <span className="sub-tab-label">Activos</span>
                <span className="sub-tab-count">{credits.filter(c => c.status === 'active').length}</span>
              </button>
              <button
                className={`sub-tab-btn ${creditSubTab === 'completed' ? 'active' : ''}`}
                onClick={() => setCreditSubTab('completed')}
              >
                <span className="sub-tab-icon">✅</span>
                <span className="sub-tab-label">Completados</span>
                <span className="sub-tab-count">{credits.filter(c => c.status === 'completed').length}</span>
              </button>
            </div>
            <button
              className="btn-export"
              onClick={exportCreditsReport}
              disabled={filteredCredits.length === 0 || generatingReport}
              title="Exportar reporte a JPG"
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">
                {generatingReport ? 'Generando...' : 'Exportar Reporte'}
              </span>
            </button>
          </div>

          {/* Tabla de créditos */}
          <div className="credits-table-container">
            {filteredCredits.length > 0 ? (
              <>
              <table className="credits-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Total a Cobrar</th>
                    <th>Pagado</th>
                    <th>Ganancia</th>
                    <th>Pendiente</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCredits.map(credit => {
                    // Calcular ganancia acumulada de este crédito (lo que ya se cobró de más del capital)
                    const profitEarned = Math.max(0, (credit.totalPaid || 0) - credit.principalAmount);
                    
                    return (
                    <tr key={credit.id}>
                      <td>{credit.date.toLocaleDateString()}</td>
                      <td>
                        <div className="client-cell">
                          <span className="client-name">{credit.clientName}</span>
                          {credit.description && (
                            <span className="client-desc">{credit.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="amount-cell">${credit.principalAmount.toFixed(2)}</td>
                      <td className="amount-cell interest">
                        ${credit.interestAmount.toFixed(2)}
                        <span className="interest-rate">({credit.interestRate}%)</span>
                      </td>
                      <td className="amount-cell total">${credit.totalAmount.toFixed(2)}</td>
                      <td className="amount-cell success">
                        ${(credit.totalPaid || 0).toFixed(2)}
                        <span className="payment-count">({credit.payments?.length || 0} pagos)</span>
                      </td>
                      <td className="amount-cell profit">
                        ${profitEarned.toFixed(2)}
                        {profitEarned > 0 && <span className="profit-indicator">💰</span>}
                      </td>
                      <td className="amount-cell warning">${(credit.remainingBalance || credit.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${credit.status}`}>
                          {credit.status === 'active' ? '⏳ Activo' : 
                           credit.status === 'completed' ? '✅ Completado' : 
                           '❌ Moroso'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-icon view"
                          onClick={() => handleViewInstallments(credit)}
                          title="Ver Pagos"
                        >
                          💵
                        </button>
                        <button 
                          className="btn-icon edit"
                          onClick={() => handleEditCredit(credit)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeleteCredit(credit.id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Paginación Créditos */}
              {totalPagesCredits > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPageCredits(prev => Math.max(1, prev - 1))}
                    disabled={currentPageCredits === 1}
                  >
                    ← Anterior
                  </button>
                  <span className="pagination-info">
                    Página {currentPageCredits} de {totalPagesCredits}
                    <span className="pagination-count">({credits.length} créditos)</span>
                  </span>
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPageCredits(prev => Math.min(totalPagesCredits, prev + 1))}
                    disabled={currentPageCredits === totalPagesCredits}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">💳</span>
                <p>
                  {creditSubTab === 'active' 
                    ? 'No hay créditos activos' 
                    : 'No hay créditos completados'}
                </p>
                {credits.length === 0 && (
                  <button 
                    className="btn-primary"
                    onClick={() => openNewModal('credit')}
                  >
                    Registrar Primer Crédito
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'purchase' && (editingItem ? 'Editar Compra' : 'Nueva Compra')}
                {modalType === 'credit' && (editingItem ? 'Editar Crédito' : 'Nuevo Crédito')}
                {modalType === 'payments' && 'Gestión de Pagos'}
              </h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Formulario de Compra */}
              {modalType === 'purchase' && (
                <form onSubmit={handlePurchaseSubmit}>
                  <div className="form-group">
                    <label>Nombre del Producto *</label>
                    <input
                      type="text"
                      value={purchaseForm.productName}
                      onChange={(e) => setPurchaseForm({...purchaseForm, productName: e.target.value})}
                      placeholder="Ej: iPhone 14 Pro"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Inversión ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={purchaseForm.investment}
                        onChange={(e) => setPurchaseForm({...purchaseForm, investment: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Precio de Venta ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={purchaseForm.salePrice}
                        onChange={(e) => setPurchaseForm({...purchaseForm, salePrice: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      value={purchaseForm.date}
                      onChange={(e) => setPurchaseForm({...purchaseForm, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción (opcional)</label>
                    <textarea
                      value={purchaseForm.description}
                      onChange={(e) => setPurchaseForm({...purchaseForm, description: e.target.value})}
                      placeholder="Detalles adicionales..."
                      rows="3"
                    />
                  </div>

                  {/* Resumen de Compra */}
                  {(purchaseForm.investment && purchaseForm.salePrice) && (
                    <div className="calculation-summary">
                      <div className="calc-item">
                        <span>Ganancia:</span>
                        <span className={calculatePurchaseMetrics().profit >= 0 ? 'success' : 'error'}>
                          ${calculatePurchaseMetrics().profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="calc-item">
                        <span>ROI:</span>
                        <span className="highlight">{calculatePurchaseMetrics().roi}%</span>
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingItem ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}

              {/* Formulario de Crédito */}
              {modalType === 'credit' && (
                <form onSubmit={handleCreditSubmit}>
                  <div className="form-group">
                    <label>Nombre del Cliente *</label>
                    <input
                      type="text"
                      value={creditForm.clientName}
                      onChange={(e) => setCreditForm({...creditForm, clientName: e.target.value})}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Capital ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={creditForm.principalAmount}
                        onChange={(e) => setCreditForm({...creditForm, principalAmount: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Tasa de Interés (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={creditForm.interestRate}
                        onChange={(e) => setCreditForm({...creditForm, interestRate: e.target.value})}
                        placeholder="0.0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Inicio *</label>
                      <input
                        type="date"
                        value={creditForm.date}
                        onChange={(e) => setCreditForm({...creditForm, date: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción (opcional)</label>
                    <textarea
                      value={creditForm.description}
                      onChange={(e) => setCreditForm({...creditForm, description: e.target.value})}
                      placeholder="Detalles adicionales..."
                      rows="3"
                    />
                  </div>

                  {/* Resumen de Crédito */}
                  {(creditForm.principalAmount && creditForm.interestRate) && (
                    <div className="calculation-summary">
                      <div className="calc-item">
                        <span>Interés Total:</span>
                        <span>${calculateCreditMetrics().interest.toFixed(2)}</span>
                      </div>
                      <div className="calc-item">
                        <span>Total a Cobrar:</span>
                        <span className="highlight">${calculateCreditMetrics().totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="info-note">
                        💡 Los pagos se registrarán manualmente y pueden variar en monto
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingItem ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}

              {/* Modal de Pagos */}
              {modalType === 'payments' && selectedCredit && (
                <div className="payments-modal">
                  <div className="credit-info">
                    <h3>{selectedCredit.clientName}</h3>
                    <div className="credit-details">
                      <span>Capital: ${selectedCredit.principalAmount.toFixed(2)}</span>
                      <span>Interés: {selectedCredit.interestRate}%</span>
                      <span>Total: ${selectedCredit.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{
                          width: `${(selectedCredit.totalPaid / selectedCredit.totalAmount) * 100}%`
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      ${selectedCredit.totalPaid?.toFixed(2) || '0.00'} de ${selectedCredit.totalAmount.toFixed(2)} pagados
                    </div>
                    <div className="remaining-balance">
                      Saldo Pendiente: <strong>${(selectedCredit.remainingBalance || selectedCredit.totalAmount).toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Formulario para agregar pago */}
                  <form className="payment-form" onSubmit={handlePaymentSubmit}>
                    <h4>Registrar Pago</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Monto *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Fecha *</label>
                        <input
                          type="date"
                          value={paymentForm.date}
                          onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Notas (opcional)</label>
                      <input
                        type="text"
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                        placeholder="Descripción del pago..."
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      ➕ Agregar Pago
                    </button>
                  </form>

                  {/* Lista de pagos registrados */}
                  <div className="payments-list">
                    <h4>Historial de Pagos</h4>
                    {selectedCredit.payments && selectedCredit.payments.length > 0 ? (
                      selectedCredit.payments.map((payment, index) => (
                        <div key={index} className="payment-item">
                          <div className="payment-header">
                            <span className="payment-amount">${payment.amount.toFixed(2)}</span>
                            <button
                              className="btn-delete-small"
                              onClick={() => handleDeletePayment(index)}
                              title="Eliminar pago"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="payment-details">
                            <span className="payment-date">
                              📅 {new Date(payment.date).toLocaleDateString()}
                            </span>
                            {payment.notes && (
                              <span className="payment-notes">📝 {payment.notes}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-message">No se han registrado pagos aún</p>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button className="btn-secondary" onClick={closeModal}>
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal/Template para reporte JPG (oculto) */}
      {showReportModal && (
        <div className="report-modal-overlay">
          <div ref={reportRef} className="credit-report">
            <div className="report-header">
              <h1>Reporte de Créditos</h1>
              <p className="report-date">Fecha: {new Date().toLocaleDateString()}</p>
              <p className="report-filter">Estado: {creditSubTab === 'active' ? 'Activos' : 'Completados'}</p>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Crédito</th>
                  <th>Pagado</th>
                  <th>Faltante</th>
                  <th>Cuotas</th>
                </tr>
              </thead>
              <tbody>
                {filteredCredits.map(credit => {
                  const pending = credit.totalAmount - (credit.totalPaid || 0);
                  
                  return (
                    <React.Fragment key={credit.id}>
                      <tr className="credit-row">
                        <td className="client-name">{credit.clientName}</td>
                        <td className="amount">${credit.totalAmount.toFixed(2)}</td>
                        <td className="paid">${(credit.totalPaid || 0).toFixed(2)}</td>
                        <td className="pending">${pending.toFixed(2)}</td>
                        <td className="installments">{credit.payments?.length || 0}</td>
                      </tr>
                      {credit.payments && credit.payments.length > 0 && (
                        <tr className="payments-row">
                          <td colSpan="5">
                            <div className="payment-dates">
                              <strong>Fechas de pago:</strong>
                              <span className="dates-list">
                                {credit.payments.map((payment, idx) => (
                                  <span key={idx} className="payment-date-item">
                                    {new Date(payment.date).toLocaleDateString()} (${payment.amount.toFixed(2)})
                                  </span>
                                ))}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td><strong>TOTALES</strong></td>
                  <td><strong>${filteredCredits.reduce((sum, c) => sum + c.totalAmount, 0).toFixed(2)}</strong></td>
                  <td><strong>${filteredCredits.reduce((sum, c) => sum + (c.totalPaid || 0), 0).toFixed(2)}</strong></td>
                  <td><strong>${filteredCredits.reduce((sum, c) => sum + (c.totalAmount - (c.totalPaid || 0)), 0).toFixed(2)}</strong></td>
                  <td><strong>{filteredCredits.reduce((sum, c) => sum + (c.payments?.length || 0), 0)}</strong></td>
                </tr>
              </tfoot>
            </table>

            <div className="report-footer">
              <p>Total de créditos: {filteredCredits.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
