# 💰 Sistema de Pagos Flexibles - Créditos

## 📋 Cambios Implementados

Se ha actualizado el sistema de créditos para permitir **pagos flexibles** en lugar de cuotas fijas predefinidas.

### ✨ Antes vs Ahora

| Antes (Cuotas Fijas) | Ahora (Pagos Flexibles) |
|----------------------|-------------------------|
| ❌ Número de cuotas obligatorio | ✅ Sin cuotas predefinidas |
| ❌ Monto por cuota fijo | ✅ Cualquier monto de pago |
| ❌ Solo marcar pagado/no pagado | ✅ Registro manual con fecha y notas |
| ❌ Inflexible ante cambios | ✅ Total flexibilidad |

---

## 🎯 Características del Nuevo Sistema

### **1. Creación de Crédito**
- **Cliente**: Nombre del cliente
- **Capital**: Monto prestado
- **Tasa de Interés**: % de interés a cobrar
- **Fecha de Inicio**: Fecha del crédito
- **Descripción**: Notas opcionales

**NO se requiere:**
- ~~Número de cuotas~~
- ~~Valor de cuota~~
- ~~Fechas de vencimiento~~

### **2. Registro de Pagos**
Cada pago se registra individualmente con:
- **Monto**: Cualquier cantidad (mayor, menor o igual a lo esperado)
- **Fecha**: Fecha del pago
- **Notas**: Descripción opcional del pago

### **3. Seguimiento Automático**
El sistema calcula automáticamente:
- ✅ Total pagado hasta el momento
- ✅ Saldo pendiente
- ✅ Número de pagos registrados
- ✅ Estado del crédito (Activo/Completado)

---

## 🚀 Cómo Usar

### **Paso 1: Crear un Crédito**

1. Ve a **💎 Inversiones** → **Créditos**
2. Click en **+ Nuevo Crédito**
3. Completa el formulario:
   ```
   Cliente: Juan Pérez
   Capital: $10,000
   Interés: 15%
   Fecha: 2025-01-01
   ```
4. El sistema calcula:
   - Interés Total: $1,500
   - Total a Cobrar: $11,500

### **Paso 2: Registrar Pagos**

1. Click en el ícono **💰** (Ver Pagos) en la tabla
2. Se abre el modal de gestión de pagos
3. Completa el formulario de pago:
   ```
   Monto: $2,000 (o cualquier cantidad)
   Fecha: 2025-02-01
   Notas: Pago parcial - mes 1
   ```
4. Click en **➕ Agregar Pago**

### **Paso 3: Ver Progreso**

En el modal de pagos verás:
- **Barra de progreso**: % pagado del total
- **Total Pagado**: $2,000 de $11,500 pagados
- **Saldo Pendiente**: $9,500
- **Historial de Pagos**: Lista de todos los pagos

---

## 📊 Casos de Uso

### **Caso 1: Pagos Variables**
```
Crédito: $10,000 + 15% = $11,500
Pago 1: $3,000 (más de lo esperado)
Pago 2: $1,500 (menos de lo esperado)
Pago 3: $7,000 (liquidación total)
Total: $11,500 ✅
```

### **Caso 2: Pagos Irregulares**
```
Crédito: $5,000 + 10% = $5,500
Pago 1: $500 (enero)
Pago 2: $1,200 (marzo - saltó febrero)
Pago 3: $800 (abril)
Pago 4: $3,000 (mayo - liquidación)
Total: $5,500 ✅
```

### **Caso 3: Sobrepagos**
```
Crédito: $8,000 + 12% = $8,960
Pago 1: $10,000 (sobrepago)
Saldo: $0 (completado)
El sistema marca automáticamente como "Completado"
```

---

## 🔍 Información en la Tabla de Créditos

| Columna | Descripción |
|---------|-------------|
| **Fecha** | Fecha de inicio del crédito |
| **Cliente** | Nombre del cliente (+ descripción) |
| **Capital** | Monto prestado original |
| **Interés** | Interés calculado + % |
| **Total a Cobrar** | Capital + Interés |
| **Pagado** | Total acumulado + # de pagos |
| **Pendiente** | Saldo restante |
| **Estado** | ⏳ Activo / ✅ Completado |
| **Acciones** | 💰 Pagos / ✏️ Editar / 🗑️ Eliminar |

---

## 💡 Ventajas del Nuevo Sistema

### **Flexibilidad**
- ✅ El cliente puede pagar cualquier monto
- ✅ Pagos adelantados o retrasados
- ✅ No hay restricción de fechas

### **Simplicidad**
- ✅ No requiere planificar cuotas por adelantado
- ✅ Registro rápido de pagos
- ✅ Fácil de entender

### **Control**
- ✅ Historial completo de pagos
- ✅ Fecha y notas de cada pago
- ✅ Posibilidad de eliminar pagos erróneos

### **Adaptabilidad**
- ✅ Ideal para acuerdos informales
- ✅ Se adapta a la capacidad de pago del cliente
- ✅ Permite renegociaciones sin modificar el sistema

---

## 🎨 Interfaz de Usuario

### **Modal de Gestión de Pagos**

```
┌─────────────────────────────────────┐
│  Juan Pérez                         │
│  Capital: $10,000  Interés: 15%     │
│  Total: $11,500                     │
│  ████████░░░░░░░░░░░ 40%           │
│  $4,000 de $11,500 pagados          │
│  Saldo Pendiente: $7,500            │
├─────────────────────────────────────┤
│  REGISTRAR PAGO                     │
│  Monto: [______]  Fecha: [_______]  │
│  Notas: [_______________________]   │
│  [➕ Agregar Pago]                  │
├─────────────────────────────────────┤
│  HISTORIAL DE PAGOS                 │
│  ┌───────────────────────────────┐  │
│  │ $2,000         🗑️             │  │
│  │ 📅 01/02/2025                 │  │
│  │ 📝 Pago inicial               │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ $2,000         🗑️             │  │
│  │ 📅 15/02/2025                 │  │
│  │ 📝 Segundo pago               │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│                      [Cerrar]       │
└─────────────────────────────────────┘
```

---

## 🔧 Estructura de Datos

### **Crédito en Firestore**
```javascript
{
  clientName: "Juan Pérez",
  principalAmount: 10000,
  interestRate: 15,
  interestAmount: 1500,
  totalAmount: 11500,
  date: Timestamp,
  description: "Crédito personal",
  payments: [
    {
      amount: 2000,
      date: Date,
      notes: "Pago inicial",
      createdAt: Date
    },
    {
      amount: 1500,
      date: Date,
      notes: "Segundo pago",
      createdAt: Date
    }
  ],
  totalPaid: 3500,
  remainingBalance: 8000,
  status: "active", // "active" | "completed"
  userId: "user_id",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔐 Reglas de Firestore (Ya Configuradas)

Las reglas de seguridad ya incluyen soporte para la colección `credits`:

```javascript
match /credits/{creditId} {
  allow read, write: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
}
```

---

## ❓ Preguntas Frecuentes

### **¿Puedo eliminar un pago por error?**
Sí, cada pago tiene un botón 🗑️ para eliminarlo.

### **¿Qué pasa si el cliente paga de más?**
El sistema acepta sobrepagos. El saldo pendiente será $0 y el crédito se marcará como "Completado".

### **¿Puedo editar un pago?**
No directamente. Elimina el pago erróneo y agrégalo nuevamente con los datos correctos.

### **¿Puedo cambiar el monto total del crédito después?**
Sí, edita el crédito y cambia el capital o la tasa de interés. Los pagos existentes se mantienen.

### **¿Cómo migrar créditos antiguos con cuotas?**
Los créditos antiguos seguirán funcionando. Para nuevos créditos, simplemente no se requiere el campo "installments".

---

## 🎯 Resumen

### **Lo Eliminado**
- ❌ Campo "Número de Cuotas"
- ❌ Array de cuotas predefinidas
- ❌ Fechas de vencimiento automáticas
- ❌ Botones "Marcar como pagado"

### **Lo Agregado**
- ✅ Formulario de registro de pagos
- ✅ Campo de monto flexible
- ✅ Campo de notas por pago
- ✅ Historial de pagos completo
- ✅ Botón para eliminar pagos
- ✅ Contador de pagos en la tabla

### **Lo Mejorado**
- ✅ Mayor flexibilidad en montos
- ✅ Mejor control de fechas reales
- ✅ Interfaz más intuitiva
- ✅ Adaptable a cualquier situación

---

**✨ ¡Sistema actualizado y listo para usar!**

Recarga tu navegador (Ctrl + F5) y prueba las nuevas funcionalidades en la vista de Inversiones → Créditos.
