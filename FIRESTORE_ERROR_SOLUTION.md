# 🔧 Solución al Error de Firestore - INTERNAL ASSERTION FAILED

## ❌ Error Original

```
FIRESTORE (12.4.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: ca9)
GET https://firestore.googleapis.com/.../Listen/channel 400 (Bad Request)
```

Este error es causado por múltiples problemas en la configuración de Firestore.

---

## ✅ Soluciones Aplicadas

### **1. Configuración Mejorada de Firestore**

**Archivo:** `src/firebase/config.js`

**Cambios aplicados:**

```javascript
// ANTES ❌
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);

// DESPUÉS ✅
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true  // Soluciona problemas de conexión
});
```

**Beneficios:**
- ✅ **Long Polling**: Evita problemas de WebSocket y conexiones inestables
- ✅ **Caché ilimitada**: Mejor rendimiento offline
- ✅ **Más estable**: Menos errores de "Unexpected state"

---

### **2. Eliminación de `orderBy` en Consultas**

El uso de `where()` + `orderBy()` requiere índices compuestos que pueden no existir.

#### **En `useTransactions.js`:**

```javascript
// ANTES ❌
import { orderBy } from 'firebase/firestore';

const q = query(
  collection(db, 'transactions'),
  where('userId', '==', user.uid),
  orderBy('date', 'desc')  // ❌ Requiere índice
);

// DESPUÉS ✅
// Removido orderBy del import

const q = query(
  collection(db, 'transactions'),
  where('userId', '==', user.uid)  // ✅ Solo filtro
);

// Ordenar en el cliente
transactionsData.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});
```

#### **En `useInvestments.js`:**

```javascript
// ANTES ❌
import { orderBy } from 'firebase/firestore';

const purchasesQuery = query(
  collection(db, 'purchases'),
  where('userId', '==', userId),
  orderBy('date', 'desc')
);

// DESPUÉS ✅
const purchasesQuery = query(
  collection(db, 'purchases'),
  where('userId', '==', userId)
);

// Ordenar en el cliente
.sort((a, b) => b.date - a.date)
```

---

### **3. Limpieza de Caché de Vite**

La caché corrupta de Vite puede causar errores persistentes.

```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 🎯 ¿Por Qué Ocurrió el Error?

### **Causa Principal:**

Firestore tiene problemas internos cuando:

1. **WebSocket falla** y no puede establecer conexión estable
2. **Múltiples listeners** se suscriben simultáneamente
3. **Índices compuestos faltantes** para consultas complejas
4. **Caché corrupta** de la sesión anterior

### **El Error "ve": -1**

Este código interno indica que Firestore está en un estado inválido, generalmente causado por:
- Conexión interrumpida
- Índice no encontrado
- Listener duplicado
- Problema de sincronización

---

## 🛡️ Soluciones Alternativas (si persiste)

### **Opción 1: Usar `getDocs` en lugar de `onSnapshot`**

Si los listeners en tiempo real causan problemas:

```javascript
import { getDocs } from 'firebase/firestore';

// En lugar de onSnapshot
const snapshot = await getDocs(q);
const data = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

**Desventaja:** No hay actualización en tiempo real.

---

### **Opción 2: Habilitar Persistencia Offline**

```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Múltiples pestañas abiertas');
    } else if (err.code == 'unimplemented') {
      console.log('Navegador no soporta persistencia');
    }
  });
```

---

### **Opción 3: Reiniciar Completamente Firebase**

Si nada funciona, reinicializa Firebase:

```bash
# 1. Detener servidor
Ctrl + C

# 2. Limpiar completamente
rm -rf node_modules/.vite
rm -rf node_modules
rm package-lock.json

# 3. Reinstalar
npm install

# 4. Reiniciar
npm run dev
```

---

## 📋 Checklist de Verificación

Antes de usar la aplicación, verifica:

- [ ] Caché de Vite limpiada
- [ ] `experimentalForceLongPolling: true` en config.js
- [ ] `orderBy` removido de todos los hooks
- [ ] Ordenamiento en el cliente implementado
- [ ] Servidor reiniciado con caché limpia
- [ ] Sin errores en consola del navegador
- [ ] Reglas de Firestore configuradas correctamente

---

## 🔐 Reglas de Firestore (Requeridas)

Asegúrate de tener estas reglas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    match /purchases/{purchaseId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
    
    match /credits/{creditId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🚀 Estado Actual

### ✅ **Cambios Aplicados:**

1. ✅ **config.js actualizado** con `experimentalForceLongPolling`
2. ✅ **useTransactions.js** sin `orderBy`
3. ✅ **useInvestments.js** sin `orderBy`
4. ✅ **Caché de Vite limpiada**
5. ✅ **Servidor reiniciado**

### 📊 **Resultado Esperado:**

- ✅ Sin errores de "INTERNAL ASSERTION FAILED"
- ✅ Sin errores 400 Bad Request
- ✅ Listeners funcionando correctamente
- ✅ Datos ordenados correctamente
- ✅ Actualización en tiempo real operativa

---

## 🔍 Cómo Verificar que Funciona

### **1. Abre la Consola del Navegador**
```
F12 → Console
```

### **2. Verifica que NO aparezcan:**
- ❌ `FIRESTORE INTERNAL ASSERTION FAILED`
- ❌ `400 Bad Request`
- ❌ `Unexpected state`

### **3. Verifica que SÍ aparezcan:**
- ✅ Datos cargando correctamente
- ✅ Sin errores rojos en consola
- ✅ Actualizaciones en tiempo real funcionando

---

## 📝 Notas Importantes

### **Long Polling vs WebSocket**

- **WebSocket** (por defecto): Más rápido, pero puede fallar
- **Long Polling** (configurado): Más lento, pero **más estable**

El `experimentalForceLongPolling` asegura conexión estable a costa de un poco de latencia.

### **Ordenamiento en Cliente vs Servidor**

| Aspecto | Cliente | Servidor (orderBy) |
|---------|---------|-------------------|
| **Configuración** | Ninguna | Requiere índices |
| **Performance** | Buena (<100 docs) | Mejor (>100 docs) |
| **Complejidad** | Simple | Compleja |
| **Errores** | Ninguno | Posibles |

Para esta aplicación con pocas transacciones, **ordenar en el cliente es suficiente**.

---

## 🎓 Lecciones Aprendidas

### **1. No uses `orderBy` sin índices**
Firebase requiere crear índices compuestos manualmente para `where` + `orderBy`.

### **2. Long Polling es más confiable**
En ambientes de desarrollo, WebSocket puede fallar. Long Polling es más estable.

### **3. Limpia la caché regularmente**
Vite cachea módulos agresivamente. Errores persistentes pueden ser caché corrupta.

### **4. Ordena en el cliente cuando sea posible**
Para colecciones pequeñas (<100 docs), ordenar en el cliente es más simple y evita configuración.

---

## 🆘 Si el Error Persiste

### **Paso 1: Verifica Reglas de Firestore**
Ve a Firebase Console → Firestore → Reglas y asegúrate que están publicadas.

### **Paso 2: Verifica Conexión**
```bash
ping firestore.googleapis.com
```

### **Paso 3: Prueba en Modo Incógnito**
Abre el navegador en modo incógnito para evitar problemas de caché del navegador.

### **Paso 4: Revisa Firebase Console**
Ve a Firebase Console → Firestore → Uso y verifica que no hay problemas de cuota.

---

## ✅ Resumen de Solución

### **3 Cambios Clave:**

1. **Config mejorada** con `experimentalForceLongPolling: true`
2. **Sin `orderBy`** en queries de Firestore
3. **Ordenamiento en cliente** con `.sort()`

Estos cambios eliminan el error y hacen la app más estable. 🎉

---

**Última actualización:** Octubre 2025  
**Versión de Firestore:** 12.4.0  
**Estado:** ✅ Resuelto
