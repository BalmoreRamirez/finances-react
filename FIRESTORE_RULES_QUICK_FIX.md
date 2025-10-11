# 🚨 SOLUCIÓN RÁPIDA - Error de Permisos en Firestore

## ❌ Error Actual
```
Error fetching purchases: FirebaseError: Missing or insufficient permissions.
Error fetching credits: FirebaseError: Missing or insufficient permissions.
```

## ✅ SOLUCIÓN (5 minutos)

### **Paso 1: Ve a Firebase Console**
1. Abre: https://console.firebase.google.com/
2. Selecciona tu proyecto: `financesapp-4d454`
3. En el menú lateral, ve a **Firestore Database**
4. Click en la pestaña **Reglas** (Rules)

### **Paso 2: Reemplaza las Reglas**
Copia y pega **EXACTAMENTE** estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // TRANSACCIONES (Existente)
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // COMPRAS (Nuevo - REQUERIDO)
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // CRÉDITOS (Nuevo - REQUERIDO)
    match /credits/{creditId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

### **Paso 3: Publicar las Reglas**
1. Click en el botón **Publicar** (azul, esquina superior derecha)
2. Confirma la publicación

### **Paso 4: Recargar la Aplicación**
1. Vuelve a tu navegador con la app
2. Presiona `Ctrl + F5` (recarga forzada)
3. Ve a la vista **💎 Inversiones**
4. Los errores deberían desaparecer

---

## 🔍 ¿Por Qué Sucede Este Error?

Firestore **requiere reglas de seguridad explícitas** para cada colección. Cuando creaste las colecciones `purchases` y `credits` en el código, Firebase las creó automáticamente, pero **sin reglas de acceso**.

Por defecto, Firebase **bloquea todo acceso** a colecciones sin reglas definidas (por seguridad).

---

## ⚠️ OPCIÓN ALTERNATIVA (Solo para desarrollo)

Si solo estás en **desarrollo/pruebas** y quieres acceso temporal sin restricciones:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **ADVERTENCIA:** Esta regla permite que cualquier usuario autenticado lea/escriba TODAS las colecciones. **NO uses esto en producción.**

---

## 📋 Checklist de Verificación

- [ ] Abrí Firebase Console
- [ ] Fui a Firestore Database → Reglas
- [ ] Copié las reglas de seguridad
- [ ] Publiqué las reglas (botón azul)
- [ ] Recargué la app con Ctrl + F5
- [ ] Los errores desaparecieron

---

## 🆘 ¿Sigues Teniendo Problemas?

1. **Verifica que estés autenticado:**
   - Cierra sesión y vuelve a iniciar sesión
   
2. **Verifica las reglas publicadas:**
   - En Firebase Console → Firestore → Reglas
   - Asegúrate que diga "Publicadas" con fecha reciente

3. **Verifica tu proyecto:**
   - Asegúrate de estar en el proyecto correcto: `financesapp-4d454`

4. **Limpia cache:**
   ```bash
   # En la terminal de VS Code:
   rm -rf node_modules/.vite
   # Luego recarga el navegador con Ctrl + F5
   ```

---

## 📚 Documentación Completa

Para más detalles sobre las reglas de seguridad, consulta:
- `FIRESTORE_RULES_INVESTMENTS.md` - Reglas completas con validaciones
- `INVESTMENTS_GUIDE.md` - Guía completa de la funcionalidad

---

**✅ Una vez aplicadas las reglas, la vista de Inversiones funcionará correctamente.**
