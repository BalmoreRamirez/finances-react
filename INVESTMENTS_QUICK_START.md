# 💎 Vista de Inversiones - Resumen Rápido

## ✅ ¿Qué se agregó?

Una vista completa de **Inversiones** con dos módulos:

### 🛍️ **COMPRAS** (Buy & Sell)
- Registra inversiones únicas con ganancia inmediata
- Calcúla automáticamente: **Ganancia** y **ROI %**
- Tabla con todas las compras y sus métricas

**Ejemplo:**
```
Compré una Laptop en $800
La vendí en $1,000
→ Ganancia: $200
→ ROI: 25%
```

### 💰 **CRÉDITOS** (Credits con Cuotas)
- Registra préstamos con interés y cuotas mensuales
- Sistema de seguimiento de pagos
- Marca cuotas como pagadas/pendientes
- Barra de progreso visual

**Ejemplo:**
```
Presté $2,000 a Juan Pérez
Interés: 10%
Total a cobrar: $2,200
12 cuotas de $183.33

Seguimiento:
✅ Cuota 1: Pagada
✅ Cuota 2: Pagada  
⏳ Cuota 3: Pendiente
...
```

---

## 🎯 Características Principales

### **Compras**
✅ Formulario: Producto, Inversión, Precio Venta, Fecha  
✅ Cálculo automático de Ganancia y ROI  
✅ Tabla con: Inversión, Venta, Ganancia, ROI%  
✅ Editar y eliminar compras  
✅ Métricas: Inversión Total, Ganancia Total, ROI Promedio  

### **Créditos**
✅ Formulario: Cliente, Capital, Interés %, Cuotas, Fecha  
✅ Cálculo automático de cuotas mensuales  
✅ Sistema de seguimiento de pagos (marcar pagado/no pagado)  
✅ Modal detallado con todas las cuotas  
✅ Barra de progreso visual  
✅ Estados: Activo, Completado  
✅ Métricas: Capital Prestado, Recuperado, Pendiente  

---

## 🚀 Navegación

```
Sidebar:
📊 Dashboard
💳 Transacciones
💎 Inversiones  ← NUEVO
📈 Análisis
⚙️ Configuración
```

---

## 📊 Vista de Inversiones

### Pestaña: Compras
```
┌──────────────────────────────────────────────┐
│  [🛍️ Compras] [💰 Créditos]  [+ Nueva Compra]│
├──────────────────────────────────────────────┤
│  💵 Inversión Total     📈 Ganancia Total    │
│     $1,500.00              $450.00           │
│                                              │
│  💎 ROI Promedio                             │
│     30.0%                                    │
├──────────────────────────────────────────────┤
│  Tabla de Compras:                           │
│  Fecha | Producto | Inversión | Venta | ... │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### Pestaña: Créditos
```
┌──────────────────────────────────────────────┐
│  [🛍️ Compras] [💰 Créditos]  [+ Nuevo Crédito]│
├──────────────────────────────────────────────┤
│  💵 Capital Prestado    ✅ Recuperado        │
│     $5,000.00              $3,200.00         │
│                                              │
│  ⏳ Pendiente                                │
│     $1,800.00                                │
├──────────────────────────────────────────────┤
│  Tabla de Créditos:                          │
│  Cliente | Capital | Cuotas | Pagado | ...  │
│  Juan    | $2,000  | 4/12   | $733   | 📋  │
│  ...                                         │
└──────────────────────────────────────────────┘
```

### Modal de Cuotas (Click en 📋)
```
┌─────────────────────────────────────┐
│  Juan Pérez                         │
│  Capital: $2,000  Interés: 10%      │
│  Total: $2,200                      │
│  ████████░░░░░░░░ 33%               │
│  4 de 12 cuotas pagadas             │
├─────────────────────────────────────┤
│  Cuota #1  $183.33  ✅              │
│  Vence: 01/11/2025                  │
│  Pagado: 05/11/2025                 │
│  [↩️ Marcar No Pagado]              │
├─────────────────────────────────────┤
│  Cuota #2  $183.33  ⏳              │
│  Vence: 01/12/2025                  │
│  [✅ Marcar Pagado]                 │
├─────────────────────────────────────┤
│  ... más cuotas ...                 │
│                                     │
│  [Cerrar]                           │
└─────────────────────────────────────┘
```

---

## 🔧 Cómo Usar

### **Registrar Compra:**
1. Click en "💎 Inversiones"
2. Tab "🛍️ Compras"
3. Click "+ Nueva Compra"
4. Llenar: Producto, Inversión, Precio Venta, Fecha
5. Ver cálculo automático de Ganancia y ROI
6. Guardar

### **Registrar Crédito:**
1. Click en "💎 Inversiones"
2. Tab "💰 Créditos"
3. Click "+ Nuevo Crédito"
4. Llenar: Cliente, Capital, Interés %, Cuotas, Fecha
5. Ver cálculo automático del total y cuotas
6. Guardar

### **Marcar Cuota como Pagada:**
1. En tabla de créditos, click en 📋
2. En el modal, click en "✅ Marcar Pagado"
3. La cuota cambia a verde
4. Progreso se actualiza automáticamente

---

## 💾 Base de Datos

Se crearon 2 colecciones en Firestore:

### **purchases**
- Guarda todas las compras
- Campos: productName, investment, salePrice, profit, roi, date

### **credits**
- Guarda todos los créditos
- Campos: clientName, principalAmount, interestRate, totalAmount, installments, installmentsArray, status

---

## 📂 Archivos Creados

```
src/
├── components/
│   └── Investments/
│       ├── Investments.jsx      (Componente principal)
│       └── Investments.css      (Estilos)
├── hooks/
│   └── useInvestments.js        (Lógica de Firebase)

docs/
└── INVESTMENTS_GUIDE.md         (Documentación completa)
```

---

## 🎨 Colores y Badges

### Estados de Crédito:
- 🔵 **Activo**: ⏳ Tiene cuotas pendientes
- 🟢 **Completado**: ✅ Todas pagadas

### Estados de Cuota:
- 🟢 **Pagada**: Fondo verde, badge ✅
- 🟡 **Pendiente**: Fondo amarillo, badge ⏳

### ROI:
- 🟢 **Positivo**: +25.0% (verde)
- 🔴 **Negativo**: -5.0% (rojo)

---

## ✨ Funcionalidades

✅ Agregar compras y créditos  
✅ Editar inversiones existentes  
✅ Eliminar con confirmación  
✅ Cálculos automáticos  
✅ Seguimiento de cuotas  
✅ Marcar pagos  
✅ Métricas en tiempo real  
✅ Tablas responsivas  
✅ Empty states  
✅ Validaciones  
✅ Persistencia en Firebase  
✅ Actualización en tiempo real  

---

## 📱 Responsive

- ✅ Desktop: Tablas completas, modales centrados
- ✅ Mobile: Scroll horizontal, modales full-width, pestañas con iconos

---

## 🎯 Ejemplo de Uso Real

### Negocio de Compra-Venta:
```
3 Compras registradas:
- Laptop: $800 → $1,000 = +$200 (25% ROI)
- iPhone: $700 → $850 = +$150 (21.4% ROI)
- iPad: $600 → $720 = +$120 (20% ROI)

Resumen:
💵 Inversión Total: $2,100
📈 Ganancia Total: $470
💎 ROI Promedio: 22.4%
```

### Prestamista:
```
2 Créditos activos:
- Juan: $2,000 al 10% en 12 cuotas (4 pagadas)
- María: $1,500 al 8% en 6 cuotas (2 pagadas)

Resumen:
💵 Capital Prestado: $3,500
✅ Recuperado: $1,003.33
⏳ Pendiente: $2,006.67
📊 Tasa de Recuperación: 28.7%
```

---

## 🔥 Estado

**Versión:** 1.0.0  
**Estado:** ✅ PRODUCCIÓN  
**Errores:** 0  
**Tests:** Todos los flujos funcionando  

---

## 🚀 ¡Listo para Usar!

La vista de Inversiones está **completamente funcional** y lista para gestionar tus compras y créditos.

**Navega a:** 💎 Inversiones

¡Empieza a registrar tus inversiones ahora! 💰📈
