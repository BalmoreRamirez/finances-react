# ⚠️ ERROR: Firestore no Configurado

## 🔴 Problema Detectado

La aplicación muestra el error:
```
FirebaseError: Missing or insufficient permissions
```

Esto significa que **Firestore no está configurado** en tu proyecto de Firebase.

## ✅ Solución: Configurar Firestore (5 minutos)

### Paso 1: Crear la Base de Datos Firestore

1. **Abre Firebase Console**: https://console.firebase.google.com/project/financesapp-4d454/firestore

2. **Click en "Crear base de datos"** (o "Create database")

3. **Selecciona el modo**:
   - Elige: **"Iniciar en modo de producción"** (Production mode)
   - Click "Siguiente"

4. **Selecciona ubicación**:
   - Elige la región más cercana (ej: `us-central1` o `southamerica-east1`)
   - Click "Habilitar" o "Enable"

5. **Espera** a que se cree la base de datos (30 segundos aprox)

### Paso 2: Configurar las Reglas de Seguridad

1. En Firestore Database, ve a la pestaña **"Reglas"** (Rules)

2. **Borra** todo el contenido actual

3. **Copia y pega** estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso a la colección de transacciones
    match /transactions/{transaction} {
      // Solo usuarios autenticados pueden leer sus propias transacciones
      allow read: if request.auth != null 
                  && request.auth.uid == resource.data.userId;
      
      // Solo usuarios autenticados pueden actualizar/eliminar sus propias transacciones
      allow update, delete: if request.auth != null 
                            && request.auth.uid == resource.data.userId;
      
      // Solo usuarios autenticados pueden crear transacciones con su propio userId
      allow create: if request.auth != null 
                    && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

4. **Click en "Publicar"** (Publish)

### Paso 3: Verificar Authentication

1. Ve a **Authentication** en el menú lateral

2. Si no está habilitado:
   - Click "Comenzar" (Get started)
   - Selecciona **"Correo electrónico/Contraseña"** (Email/Password)
   - **Habilita** el primer toggle
   - Click "Guardar"

### Paso 4: Recargar la Aplicación

1. Vuelve a tu navegador con la aplicación
2. Presiona **Ctrl + Shift + R** (recarga forzada)
3. Intenta registrarte nuevamente

## 🎯 Acceso Rápido

- **Firestore**: https://console.firebase.google.com/project/financesapp-4d454/firestore
- **Authentication**: https://console.firebase.google.com/project/financesapp-4d454/authentication
- **Reglas**: https://console.firebase.google.com/project/financesapp-4d454/firestore/rules

## ✅ Verificación

Después de configurar, deberías poder:
1. ✅ Registrar un nuevo usuario
2. ✅ Iniciar sesión
3. ✅ Agregar transacciones
4. ✅ Ver el balance actualizado

## 🆘 ¿Todavía hay errores?

Si después de seguir estos pasos sigues teniendo problemas:

1. **Verifica** que las reglas se publicaron correctamente
2. **Limpia caché** del navegador (Ctrl + Shift + Delete)
3. **Cierra sesión** y vuelve a iniciar
4. **Revisa** la consola de Firebase para más detalles

---

**Nota**: Este error es normal cuando Firebase aún no ha sido configurado. Una vez que sigas estos pasos, la aplicación funcionará perfectamente.
