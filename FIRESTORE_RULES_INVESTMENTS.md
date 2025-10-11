# 🔒 Reglas de Seguridad de Firestore - Inversiones

## 📋 Reglas Recomendadas

Estas son las reglas de seguridad que debes configurar en tu consola de Firebase para las colecciones de Inversiones.

### **Cómo aplicar estas reglas:**

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Reglas**
4. Copia y pega las reglas de abajo
5. Click en **Publicar**

---

## 🔐 Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===================================
    // TRANSACCIONES (Existente)
    // ===================================
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // ===================================
    // COMPRAS (Nuevo)
    // ===================================
    match /purchases/{purchaseId} {
      // Solo el dueño puede leer sus compras
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Solo usuarios autenticados pueden crear compras
      // Y el userId debe coincidir con el usuario autenticado
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.productName is string &&
                       request.resource.data.investment is number &&
                       request.resource.data.salePrice is number;
      
      // Solo el dueño puede actualizar o eliminar sus compras
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // ===================================
    // CRÉDITOS (Nuevo)
    // ===================================
    match /credits/{creditId} {
      // Solo el dueño puede leer sus créditos
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Solo usuarios autenticados pueden crear créditos
      // Y el userId debe coincidir con el usuario autenticado
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.clientName is string &&
                       request.resource.data.principalAmount is number &&
                       request.resource.data.interestRate is number &&
                       request.resource.data.installments is number;
      
      // Solo el dueño puede actualizar o eliminar sus créditos
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📊 Índices Compuestos (Opcional para mejor performance)

**NOTA:** Con la corrección aplicada, estos índices **NO son necesarios** porque el ordenamiento se hace en el cliente. Sin embargo, si en el futuro quieres ordenar directamente en Firestore para mejor performance con grandes cantidades de datos, puedes crear estos índices:

### **Cómo crear índices:**

1. Ve a **Firestore Database** → **Índices**
2. Click en **Crear índice**
3. Configura según las especificaciones de abajo

### **Índice para `purchases`**

```
Colección: purchases
Campos a indexar:
  - userId (Ascendente)
  - date (Descendente)
Ámbito de consulta: Colección
Estado: Habilitado
```

### **Índice para `credits`**

```
Colección: credits
Campos a indexar:
  - userId (Ascendente)
  - date (Descendente)
Ámbito de consulta: Colección
Estado: Habilitado
```

---

## 🔍 Explicación de las Reglas

### **Lectura (read)**
```javascript
allow read: if request.auth != null && 
               resource.data.userId == request.auth.uid;
```
- ✅ Usuario debe estar autenticado (`request.auth != null`)
- ✅ Solo puede leer documentos donde el `userId` coincida con su UID

### **Creación (create)**
```javascript
allow create: if request.auth != null && 
                 request.resource.data.userId == request.auth.uid &&
                 request.resource.data.productName is string;
```
- ✅ Usuario debe estar autenticado
- ✅ El documento debe tener el `userId` del usuario autenticado
- ✅ Validación de tipos de datos requeridos

### **Actualización/Eliminación (update/delete)**
```javascript
allow update, delete: if request.auth != null && 
                         resource.data.userId == request.auth.uid;
```
- ✅ Usuario debe estar autenticado
- ✅ Solo puede modificar/eliminar sus propios documentos

---

## 🛡️ Validaciones de Seguridad

### **Compras**
- ✅ `userId` debe ser string y coincidir con el usuario autenticado
- ✅ `productName` debe ser string
- ✅ `investment` debe ser number
- ✅ `salePrice` debe ser number

### **Créditos**
- ✅ `userId` debe ser string y coincidir con el usuario autenticado
- ✅ `clientName` debe ser string
- ✅ `principalAmount` debe ser number
- ✅ `interestRate` debe ser number
- ✅ `installments` debe ser number

---

## ✅ Checklist de Configuración

- [ ] Copiar reglas de seguridad a la consola de Firebase
- [ ] Publicar las reglas
- [ ] Verificar que no hay errores en la consola
- [ ] (Opcional) Crear índices compuestos para mejor performance
- [ ] Probar crear una compra desde la app
- [ ] Probar crear un crédito desde la app
- [ ] Verificar que solo veas tus propios datos

---

## 🚨 Reglas de Desarrollo (Solo para Testing)

**⚠️ NUNCA uses estas reglas en producción**

Si necesitas reglas más permisivas temporalmente para desarrollo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // SOLO PARA DESARROLLO - Permite todo
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📝 Notas Importantes

1. **Sin Índices:** La app ahora ordena los datos en el cliente, así que NO necesitas crear los índices compuestos inmediatamente.

2. **Performance:** Para colecciones pequeñas (<100 documentos), ordenar en el cliente es suficiente y evita configuración adicional.

3. **Escalabilidad:** Si en el futuro tienes miles de compras o créditos, puedes crear los índices y cambiar el código para usar `orderBy` de Firestore.

4. **Seguridad:** Las reglas garantizan que cada usuario solo pueda ver y modificar sus propios datos.

---

## 🔧 Solución Aplicada al Error

### **Problema Original:**
```
FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state
```

### **Causa:**
Las consultas usaban `where` + `orderBy` sin índices compuestos:
```javascript
query(
  collection(db, 'purchases'),
  where('userId', '==', userId),
  orderBy('date', 'desc')  // ❌ Requiere índice
)
```

### **Solución:**
Remover `orderBy` de Firestore y ordenar en el cliente:
```javascript
query(
  collection(db, 'purchases'),
  where('userId', '==', userId)  // ✅ Solo filtro
)
// Luego ordenar en el cliente:
.sort((a, b) => b.date - a.date)
```

---

## ✅ Estado Actual

- ✅ **Error de Firestore corregido**
- ✅ **Sin necesidad de índices compuestos**
- ✅ **Reglas de seguridad documentadas**
- ✅ **App funcionando correctamente**

---

**Última actualización:** Octubre 2025  
**Versión de Firestore:** 12.4.0
