# 💰 Finanzas Personales - React + Firebase

Una aplicación web moderna para el control de finanzas personales, desarrollada con React y Firebase.

## 🚀 Características

- ✅ **Autenticación de usuarios** con Firebase Auth
- 💵 **Registro de transacciones** (Ingresos y Egresos)
- 📊 **Dashboard interactivo** con balance en tiempo real
- 🏷️ **Categorización** de transacciones
- 📱 **Diseño responsive** para móviles y desktop
- 🔄 **Sincronización en tiempo real** con Firestore
- 🎨 **Interfaz moderna** y amigable

## 📋 Categorías

### Ingresos
- Salario
- Freelance
- Inversiones
- Ventas
- Otros

### Egresos
- Alimentación
- Transporte
- Servicios
- Entretenimiento
- Salud
- Educación
- Otros

## 🛠️ Tecnologías

- **React** 18+ con Vite
- **Firebase** (Authentication + Firestore)
- **CSS3** con diseño moderno

## 📦 Instalación

Las dependencias ya están instaladas. Para iniciar el proyecto:

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`

## 🔧 Configuración de Firebase

La configuración de Firebase ya está incluida en el proyecto en `src/firebase/config.js`.

### ⚠️ IMPORTANTE: Configurar Firestore

Debes configurar las reglas de seguridad en Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **financesapp-4d454**
3. Ve a **Firestore Database** → **Reglas**
4. Copia y pega estas reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transaction} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

5. **Publica** las reglas

### Habilitar Authentication

1. En Firebase Console → **Authentication**
2. Click en **Comenzar**
3. Habilita el proveedor **Correo electrónico/Contraseña**

## 📱 Uso

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Agregar Transacción**: Click en "+ Nueva Transacción"
3. **Ver Balance**: El dashboard muestra tu balance total, ingresos y egresos
4. **Historial**: Visualiza todas tus transacciones ordenadas por fecha
5. **Eliminar**: Click en el icono 🗑️ para eliminar una transacción

## 🚀 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run preview  # Preview de build de producción
```

---

**¡Comienza a controlar tus finanzas hoy! 💰📊**

