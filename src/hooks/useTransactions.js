import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Consulta sin orderBy para evitar error de índice mientras se crea
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Ordenar manualmente por fecha (descendente)
        transactionsData.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        setTransactions(transactionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al escuchar transacciones:', error);
        if (error.code === 'permission-denied') {
          console.error('⚠️ FIRESTORE NO CONFIGURADO: Lee ERROR_FIRESTORE.md');
        } else if (error.code === 'failed-precondition') {
          console.error('⚠️ ÍNDICE REQUERIDO: Creándose automáticamente...');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (transaction) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId: user.uid,
        date: new Date(transaction.date).toISOString(),
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al agregar transacción:', error);
      
      let errorMessage = error.message;
      
      if (error.code === 'permission-denied') {
        errorMessage = '⚠️ Firestore no está configurado. Por favor, configura la base de datos y las reglas de seguridad en Firebase Console.';
        console.error('📖 Lee el archivo ERROR_FIRESTORE.md para instrucciones detalladas');
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      return { success: false, error: error.message };
    }
  };

  const getBalance = () => {
    const income = transactions
      .filter(t => t.type === 'ingreso')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'egreso')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      income,
      expense,
      total: income - expense
    };
  };

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getBalance
  };
};
