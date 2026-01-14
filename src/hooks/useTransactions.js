import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { parseDateYMDToSVMidnightUTC } from '../utils/dateTZ';
import { getAccountById, TRANSACTION_ACCOUNT_DEFAULTS } from '../services/accounts';

const ACCOUNT_MIGRATION_VERSION = 'v2-compact-accounts';

const remapAccountId = (accountId) => {
  const map = {
    'activos-disponibles': 'activos-banco',
    'activos-billetera': 'activos-banco',
    'activos-cuentas-por-cobrar': 'activos-prestamos-otorgados',
    'inversion-ganancias': 'ingresos-ganancias-inversion',
    'inversion-capital': 'activos-fondo-inversiones',
    'pasivos-cuentas-por-pagar': 'pasivos-prestamos-recibidos',
    'patrimonio-capital': 'activos-banco',
    'ingresos-otros': 'ingresos-ordinarios',
    'gastos-perdidas-inversion': 'gastos-operativos',
  };
  return map[accountId] || accountId;
};

const buildAccountMetadata = (transaction) => {
  const defaults = TRANSACTION_ACCOUNT_DEFAULTS[transaction.type] || {};
  const fromAccountId = transaction.fromAccountId || defaults.from || null;
  const toAccountId = transaction.toAccountId || defaults.to || null;
  const fromAccount = fromAccountId ? getAccountById(fromAccountId) : null;
  const toAccount = toAccountId ? getAccountById(toAccountId) : null;

  return {
    fromAccountId,
    toAccountId,
    fromAccountName: fromAccount ? fromAccount.label : transaction.fromAccountName || null,
    toAccountName: toAccount ? toAccount.label : transaction.toAccountName || null,
    fromAccountCategory: fromAccount ? fromAccount.categoryKey : transaction.fromAccountCategory || null,
    toAccountCategory: toAccount ? toAccount.categoryKey : transaction.toAccountCategory || null,
  };
};

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
        const transactionsData = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            ...buildAccountMetadata(data),
          };
        });
        
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

  useEffect(() => {
    if (!user || transactions.length === 0) return;

    const migrateAccounts = async () => {
      const candidates = transactions.filter((tx) => tx.migrationAccountVersion !== ACCOUNT_MIGRATION_VERSION);
      if (candidates.length === 0) return;

      for (const tx of candidates) {
        let newFrom = remapAccountId(tx.fromAccountId);
        const newTo = remapAccountId(tx.toAccountId);

        if (tx.autoSourceType === 'credit') {
          newFrom = 'ingresos-intereses';
        }
        const needsUpdate = newFrom !== tx.fromAccountId || newTo !== tx.toAccountId || !tx.migrationAccountVersion;
        if (!needsUpdate) continue;

        try {
          await updateDoc(doc(db, 'transactions', tx.id), {
            fromAccountId: newFrom,
            toAccountId: newTo,
            migrationAccountVersion: ACCOUNT_MIGRATION_VERSION,
          });
        } catch (migrationError) {
          console.error('Error migrando cuentas de transacción:', tx.id, migrationError);
          if (migrationError.code === 'permission-denied') {
            break;
          }
        }
      }
    };

    migrateAccounts();
  }, [transactions, user]);

  const addTransaction = async (transaction) => {
    try {
      const normalizedDate = parseDateYMDToSVMidnightUTC(transaction.date).toISOString();
      const nowIso = new Date().toISOString();
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        ...buildAccountMetadata(transaction),
        userId: user.uid,
        date: normalizedDate,
        createdAt: nowIso
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

  const updateTransaction = async (id, transaction) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      const normalizedDate = parseDateYMDToSVMidnightUTC(transaction.date).toISOString();
      const nowIso = new Date().toISOString();
      await updateDoc(transactionRef, {
        ...transaction,
        ...buildAccountMetadata(transaction),
        date: normalizedDate,
        updatedAt: nowIso
      });
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      
      let errorMessage = error.message;
      
      if (error.code === 'permission-denied') {
        errorMessage = '⚠️ Firestore no está configurado. Por favor, configura la base de datos y las reglas de seguridad en Firebase Console.';
        console.error('📖 Lee el archivo ERROR_FIRESTORE.md para instrucciones detalladas');
      }
      
      return { success: false, error: errorMessage };
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
    updateTransaction,
    deleteTransaction,
    getBalance
  };
};
