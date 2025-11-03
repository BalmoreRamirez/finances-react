import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { parseDateYMDToSVMidnightUTC } from '../utils/dateTZ';

export const useInvestments = (userId) => {
  const [purchases, setPurchases] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setPurchases([]);
      setCredits([]);
      setLoading(false);
      return;
    }

    // Suscripción a compras (solo filtro por userId, ordenamiento en cliente)
    const purchasesQuery = query(
      collection(db, 'purchases'),
      where('userId', '==', userId)
    );

    const unsubscribePurchases = onSnapshot(
      purchasesQuery,
      (snapshot) => {
        const purchasesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date()
        }))
        .sort((a, b) => b.date - a.date); // Ordenar en el cliente
        
        setPurchases(purchasesData);
      },
      (err) => {
        console.error('Error fetching purchases:', err);
        setError(err.message);
      }
    );

    // Suscripción a créditos (solo filtro por userId, ordenamiento en cliente)
    const creditsQuery = query(
      collection(db, 'credits'),
      where('userId', '==', userId)
    );

    const unsubscribeCredits = onSnapshot(
      creditsQuery,
      (snapshot) => {
        const creditsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
            // Convertir fechas de pagos de Timestamp a Date
            payments: (data.payments || []).map(payment => ({
              ...payment,
              date: payment.date?.toDate ? payment.date.toDate() : new Date(payment.date),
              createdAt: payment.createdAt?.toDate ? payment.createdAt.toDate() : new Date()
            }))
          };
        })
        .sort((a, b) => b.date - a.date); // Ordenar en el cliente
        
        setCredits(creditsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching credits:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribePurchases();
      unsubscribeCredits();
    };
  }, [userId]);

  // Agregar compra
  const addPurchase = async (purchaseData) => {
    try {
      const normalizedDate = parseDateYMDToSVMidnightUTC(purchaseData.date);
      const newPurchase = {
        ...purchaseData,
        userId,
        date: Timestamp.fromDate(normalizedDate),
        profit: purchaseData.salePrice - purchaseData.investment,
        roi: ((purchaseData.salePrice - purchaseData.investment) / purchaseData.investment) * 100,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'purchases'), newPurchase);
      return { success: true };
    } catch (err) {
      console.error('Error adding purchase:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar compra
  const updatePurchase = async (purchaseId, purchaseData) => {
    try {
      const purchaseRef = doc(db, 'purchases', purchaseId);
      const normalizedDate = purchaseData.date instanceof Date
          ? purchaseData.date
          : parseDateYMDToSVMidnightUTC(purchaseData.date);
      const updatedData = {
        ...purchaseData,
        date: Timestamp.fromDate(normalizedDate),
        profit: purchaseData.salePrice - purchaseData.investment,
        roi: ((purchaseData.salePrice - purchaseData.investment) / purchaseData.investment) * 100,
        updatedAt: Timestamp.now()
      };

      await updateDoc(purchaseRef, updatedData);
      return { success: true };
    } catch (err) {
      console.error('Error updating purchase:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar compra
  const deletePurchase = async (purchaseId) => {
    try {
      await deleteDoc(doc(db, 'purchases', purchaseId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting purchase:', err);
      return { success: false, error: err.message };
    }
  };

  // Agregar crédito
  const addCredit = async (creditData) => {
    try {
      const normalizedDate = parseDateYMDToSVMidnightUTC(creditData.date);
      const newCredit = {
        ...creditData,
        userId,
        date: Timestamp.fromDate(normalizedDate),
        payments: [],
        totalPaid: 0,
        remainingBalance: creditData.totalAmount,
        status: 'active',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'credits'), newCredit);
      return { success: true };
    } catch (err) {
      console.error('Error adding credit:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar crédito
  const updateCredit = async (creditId, creditData) => {
    try {
      const creditRef = doc(db, 'credits', creditId);
      const normalizedDate = creditData.date instanceof Date
          ? creditData.date
          : parseDateYMDToSVMidnightUTC(creditData.date);

      let updatedData = {
        ...creditData,
        date: Timestamp.fromDate(normalizedDate),
        updatedAt: Timestamp.now()
      };

      await updateDoc(creditRef, updatedData);
      return { success: true };
    } catch (err) {
      console.error('Error updating credit:', err);
      return { success: false, error: err.message };
    }
  };

  // Agregar pago a un crédito
  const addPayment = async (creditId, paymentAmount, paymentDate = new Date(), notes = '') => {
    try {
      const credit = credits.find(c => c.id === creditId);
      if (!credit) throw new Error('Credit not found');

      const parsedPaymentDate = paymentDate instanceof Date ? paymentDate : parseDateYMDToSVMidnightUTC(paymentDate);

      const newPayment = {
        amount: parseFloat(paymentAmount),
        date: Timestamp.fromDate(parsedPaymentDate),
        notes: notes,
        createdAt: Timestamp.now()
      };

      const updatedPayments = [...(credit.payments || []), newPayment];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = credit.totalAmount - totalPaid;
      const status = remainingBalance <= 0 ? 'completed' : 'active';

      const creditRef = doc(db, 'credits', creditId);
      await updateDoc(creditRef, {
        payments: updatedPayments,
        totalPaid,
        remainingBalance: Math.max(0, remainingBalance),
        status,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (err) {
      console.error('Error adding payment:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar pago de un crédito
  const deletePayment = async (creditId, paymentIndex) => {
    try {
      const credit = credits.find(c => c.id === creditId);
      if (!credit) throw new Error('Credit not found');

      const updatedPayments = credit.payments.filter((_, index) => index !== paymentIndex);
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = credit.totalAmount - totalPaid;
      const status = remainingBalance <= 0 ? 'completed' : 'active';

      const creditRef = doc(db, 'credits', creditId);
      await updateDoc(creditRef, {
        payments: updatedPayments,
        totalPaid,
        remainingBalance: Math.max(0, remainingBalance),
        status,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (err) {
      console.error('Error deleting payment:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar crédito
  const deleteCredit = async (creditId) => {
    try {
      await deleteDoc(doc(db, 'credits', creditId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting credit:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    purchases,
    credits,
    loading,
    error,
    addPurchase,
    updatePurchase,
    deletePurchase,
    addCredit,
    updateCredit,
    deleteCredit,
    addPayment,
    deletePayment
  };
};
