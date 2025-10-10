# 🔥 REGLAS DE FIRESTORE - COPIA Y PEGA

## ⚠️ PASO IMPORTANTE: Configurar Reglas de Seguridad

### 📋 En Firebase Console:

1. **Ve a la pestaña "Reglas"** (está al lado de "Datos")
2. **Borra todo** el contenido actual
3. **Copia y pega** exactamente esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transaction} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. **Click en "Publicar"** (botón azul arriba a la derecha)

### ✅ Después de publicar:

1. Vuelve a tu aplicación
2. Presiona **Ctrl + Shift + R** para recargar
3. Regístrate o inicia sesión
4. ¡Listo! Ya puedes agregar transacciones

---

## 📝 ¿Qué hacen estas reglas?

- ✅ Solo usuarios autenticados pueden acceder
- ✅ Cada usuario solo ve sus propias transacciones
- ✅ No se pueden crear transacciones en nombre de otros
- ✅ Protege la privacidad de los datos

---

## 🎯 Verificación Rápida

Si después de configurar las reglas aún ves errores:

1. **Asegúrate de que Authentication está habilitado:**
   - Ve a Authentication → Sign-in method
   - Habilita "Email/Password"

2. **Limpia la caché del navegador:**
   - Ctrl + Shift + Delete
   - Selecciona "Últimas 24 horas"
   - Marca "Caché" e "Imágenes"

3. **Recarga la app:**
   - Presiona Ctrl + Shift + R
