# 🔥 Configuración de Firebase

## Pasos para configurar Firebase Firestore

### 1. Crear la base de datos Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto: **financesapp-4d454**
3. En el menú lateral, click en **Firestore Database**
4. Click en **Crear base de datos**
5. Selecciona **Iniciar en modo de prueba** (luego configuraremos las reglas de seguridad)
6. Elige la ubicación más cercana (ej: us-central)
7. Click en **Habilitar**

### 2. Configurar las Reglas de Seguridad

Una vez creada la base de datos:

1. Ve a la pestaña **Reglas** en Firestore Database
2. Reemplaza las reglas por defecto con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de transacciones
    match /transactions/{transaction} {
      // Permitir leer solo si el usuario está autenticado y es el dueño
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Permitir escribir solo si el usuario está autenticado y es el dueño
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Permitir crear solo si el usuario está autenticado y establece su propio userId
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click en **Publicar**

### 3. Habilitar Authentication

1. En el menú lateral, click en **Authentication**
2. Click en **Comenzar**
3. Ve a la pestaña **Sign-in method**
4. Click en **Correo electrónico/Contraseña**
5. Habilita **Correo electrónico/Contraseña** (el primer toggle)
6. Click en **Guardar**

### 4. Verificar la configuración

La configuración en `src/firebase/config.js` ya incluye las credenciales del proyecto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBNsqGh41yB1mEODhjdicSRdz6NGeDLxZc",
  authDomain: "financesapp-4d454.firebaseapp.com",
  projectId: "financesapp-4d454",
  storageBucket: "financesapp-4d454.firebasestorage.app",
  messagingSenderId: "194210663985",
  appId: "1:194210663985:web:11444de3fe7f4d6aa94f10"
};
```

## ✅ ¡Listo!

Una vez completados estos pasos, tu aplicación estará lista para:
- Registrar y autenticar usuarios
- Guardar transacciones en Firestore
- Sincronizar datos en tiempo real
- Mantener la seguridad de los datos de cada usuario

## 🧪 Probar la aplicación

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre `http://localhost:5173`
3. Regístrate con un email y contraseña
4. Comienza a agregar transacciones

## 🔒 Seguridad

Las reglas de Firestore garantizan que:
- Solo usuarios autenticados pueden acceder a los datos
- Cada usuario solo puede ver y modificar sus propias transacciones
- No se pueden crear transacciones en nombre de otros usuarios
