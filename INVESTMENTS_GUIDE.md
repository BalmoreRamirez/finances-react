# 💎 Vista de Inversiones - Documentación Completa

## 📋 Resumen

La vista de **Inversiones** es un módulo completo para gestionar dos tipos de operaciones financieras:

1. **🛍️ Compras** - Inversiones únicas con ganancia inmediata
2. **💰 Créditos** - Inversiones a largo plazo con sistema de cuotas

---

## 🎯 Características Principales

### **Compras (Buy & Sell)**

#### Funcionalidades:
- ✅ Registrar inversión y precio de venta
- ✅ Cálculo automático de ganancia
- ✅ Cálculo de ROI (Return on Investment)
- ✅ Editar y eliminar compras
- ✅ Tabla detallada con métricas

#### Datos que se registran:
```javascript
{
  productName: string,      // Nombre del producto/servicio
  investment: number,        // Inversión inicial
  salePrice: number,         // Precio de venta
  profit: number,            // Ganancia (calculado)
  roi: number,               // ROI % (calculado)
  date: Date,                // Fecha de la operación
  description: string        // Descripción opcional
}
```

#### Cálculos automáticos:
```javascript
Ganancia = Precio de Venta - Inversión
ROI (%) = (Ganancia / Inversión) × 100
```

### **Créditos (Credits)**

#### Funcionalidades:
- ✅ Registrar préstamos con interés
- ✅ Sistema de cuotas mensuales
- ✅ Seguimiento de pagos (marcar como pagado/no pagado)
- ✅ Cálculo automático de intereses y cuotas
- ✅ Barra de progreso visual
- ✅ Estados: Activo, Completado, Moroso
- ✅ Editar y eliminar créditos

#### Datos que se registran:
```javascript
{
  clientName: string,           // Nombre del cliente
  principalAmount: number,      // Capital prestado
  interestRate: number,         // Tasa de interés %
  interestAmount: number,       // Monto del interés (calculado)
  totalAmount: number,          // Total a cobrar (calculado)
  installments: number,         // Número de cuotas
  paidInstallments: number,     // Cuotas pagadas
  totalPaid: number,            // Total recuperado
  remainingBalance: number,     // Saldo pendiente
  status: string,               // active | completed | defaulted
  installmentsArray: Array,     // Array de cuotas
  date: Date,                   // Fecha de inicio
  description: string           // Descripción opcional
}
```

#### Estructura de Cuotas:
```javascript
installment = {
  number: 1,                    // Número de cuota
  amount: 100.00,               // Valor de la cuota
  dueDate: Date,                // Fecha de vencimiento
  paid: false,                  // Estado de pago
  paidDate: null                // Fecha de pago (si aplica)
}
```

#### Cálculos automáticos:
```javascript
Interés Total = (Capital × Tasa) / 100
Total a Cobrar = Capital + Interés Total
Valor por Cuota = Total a Cobrar / Número de Cuotas
Fecha Vencimiento = Fecha Inicio + (N meses)
```

---

## 🎨 Interfaz de Usuario

### **Pestañas Principales**

```
┌─────────────────────────────────────────┐
│  [🛍️ Compras (5)]  [💰 Créditos (3)]   │
│                        [+ Nueva Compra] │
└─────────────────────────────────────────┘
```

### **Resumen de Compras**

```
┌──────────────┬──────────────┬──────────────┐
│ 💵 Inversión │ 📈 Ganancia  │ 💎 ROI Prom. │
│   $1,500.00  │   $450.00    │    30.0%     │
└──────────────┴──────────────┴──────────────┘
```

### **Resumen de Créditos**

```
┌──────────────┬──────────────┬──────────────┐
│ 💵 Capital   │ ✅ Recuperado│ ⏳ Pendiente │
│   $5,000.00  │   $3,200.00  │  $1,800.00   │
└──────────────┴──────────────┴──────────────┘
```

### **Tabla de Compras**

| Fecha      | Producto/Servicio | Inversión | Venta     | Ganancia | ROI    | Acciones |
|------------|-------------------|-----------|-----------|----------|--------|----------|
| 05/10/2025 | Laptop Dell       | $800.00   | $1,000.00 | $200.00  | 25.0%  | ✏️ 🗑️   |
| 03/10/2025 | iPhone 13         | $700.00   | $850.00   | $150.00  | 21.4%  | ✏️ 🗑️   |

### **Tabla de Créditos**

| Fecha      | Cliente    | Capital   | Interés      | Total     | Cuotas | Pagado    | Pendiente | Estado      | Acciones    |
|------------|------------|-----------|--------------|-----------|--------|-----------|-----------|-------------|-------------|
| 01/10/2025 | Juan Pérez | $2,000.00 | $200.00 (10%)| $2,200.00 | 4 / 12 | $733.33   | $1,466.67 | ⏳ Activo  | 📋 ✏️ 🗑️  |

---

## 📱 Modal de Cuotas

Al hacer clic en 📋 en un crédito, se abre un modal detallado:

```
┌─────────────────────────────────────────────┐
│  Juan Pérez                                 │
│  Capital: $2,000.00  Interés: 10%           │
│  Total: $2,200.00                           │
│  ████████░░░░░░░░░░░░░░░░░░░░ 33%          │
│  4 de 12 cuotas pagadas                     │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │ Cuota #1              $183.33     ✅  │  │
│  │ Vence: 01/11/2025                     │  │
│  │ Pagado: 05/11/2025                    │  │
│  │ [↩️ Marcar No Pagado]                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Cuota #2              $183.33     ⏳  │  │
│  │ Vence: 01/12/2025                     │  │
│  │ [✅ Marcar Pagado]                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ...más cuotas...                           │
│                                             │
│  [Cerrar]                                   │
└─────────────────────────────────────────────┘
```

---

## 🔧 Uso Detallado

### **1. Registrar una Compra**

#### Paso a Paso:
1. Click en la pestaña **"🛍️ Compras"**
2. Click en botón **"+ Nueva Compra"**
3. Llenar formulario:
   - **Producto/Servicio**: Nombre del artículo
   - **Inversión**: Cuánto pagaste
   - **Precio de Venta**: Por cuánto lo vendiste
   - **Fecha**: Fecha de la transacción
   - **Descripción** (opcional): Detalles adicionales

4. Ver resumen automático:
   ```
   Ganancia: $150.00
   ROI: 21.4%
   ```

5. Click en **"Guardar"**

#### Ejemplo:
```
Producto: iPhone 13
Inversión: $700.00
Venta: $850.00
Fecha: 05/10/2025
Descripción: Comprado en liquidación, vendido en Marketplace

→ Ganancia: $150.00
→ ROI: 21.4%
```

### **2. Registrar un Crédito**

#### Paso a Paso:
1. Click en la pestaña **"💰 Créditos"**
2. Click en botón **"+ Nuevo Crédito"**
3. Llenar formulario:
   - **Cliente**: Nombre del deudor
   - **Capital**: Monto prestado
   - **Tasa de Interés**: Porcentaje de interés
   - **Cuotas**: Número de pagos mensuales
   - **Fecha de Inicio**: Cuándo inicia el crédito
   - **Descripción** (opcional): Detalles del acuerdo

4. Ver resumen automático:
   ```
   Interés Total: $200.00
   Total a Cobrar: $2,200.00
   Valor por Cuota: $183.33
   ```

5. Click en **"Guardar"**

#### Ejemplo:
```
Cliente: María González
Capital: $2,000.00
Interés: 10%
Cuotas: 12
Fecha: 01/10/2025
Descripción: Crédito personal para emergencia médica

→ Interés Total: $200.00
→ Total a Cobrar: $2,200.00
→ Cuota Mensual: $183.33
→ 12 cuotas de $183.33 c/u
```

### **3. Gestionar Pagos de Cuotas**

#### Paso a Paso:
1. En la tabla de créditos, click en **📋** (Ver Cuotas)
2. Se abre el modal con todas las cuotas
3. Para marcar como pagado:
   - Click en **"✅ Marcar Pagado"** en cuota pendiente
   - La cuota cambia a verde
   - Se actualiza el progreso automáticamente
   
4. Para desmarcar un pago:
   - Click en **"↩️ Marcar No Pagado"** en cuota pagada
   - La cuota vuelve a amarillo/pendiente
   - Se actualiza el saldo pendiente

#### Actualización Automática:
- ✅ **Cuotas Pagadas**: Cuenta actualizada
- 💰 **Total Recuperado**: Suma de cuotas pagadas
- ⏳ **Saldo Pendiente**: Total - Recuperado
- 📊 **Barra de Progreso**: Visual del avance
- 🏷️ **Estado**: Cambia a "Completado" cuando todas están pagadas

### **4. Editar Inversiones**

#### Para Compras:
1. Click en ✏️ en la fila de la compra
2. Modificar datos en el formulario
3. Click en **"Actualizar"**
4. Ganancia y ROI se recalculan automáticamente

#### Para Créditos:
1. Click en ✏️ en la fila del crédito
2. Modificar datos (⚠️ esto recalcula todas las cuotas)
3. Click en **"Actualizar"**
4. Las cuotas se regeneran con los nuevos valores

⚠️ **Advertencia**: Editar un crédito **reinicia** el estado de las cuotas.

### **5. Eliminar Inversiones**

1. Click en 🗑️ en la fila correspondiente
2. Confirmar eliminación en el diálogo
3. El registro se elimina permanentemente

---

## 💾 Almacenamiento en Firebase

### **Colecciones de Firestore**

#### `purchases`
```javascript
{
  userId: "abc123",
  productName: "Laptop Dell",
  investment: 800,
  salePrice: 1000,
  profit: 200,
  roi: 25,
  date: Timestamp,
  description: "...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `credits`
```javascript
{
  userId: "abc123",
  clientName: "Juan Pérez",
  principalAmount: 2000,
  interestRate: 10,
  interestAmount: 200,
  totalAmount: 2200,
  installments: 12,
  installmentsArray: [
    {
      number: 1,
      amount: 183.33,
      dueDate: Date,
      paid: true,
      paidDate: Date
    },
    // ... más cuotas
  ],
  paidInstallments: 4,
  totalPaid: 733.32,
  remainingBalance: 1466.68,
  status: "active",
  date: Timestamp,
  description: "...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **Reglas de Firestore Recomendadas**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Compras
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Créditos
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

---

## 🔍 Índices de Firestore

Para mejor performance, crear estos índices compuestos:

### **purchases**
```
Collection ID: purchases
Fields:
  - userId (Ascending)
  - date (Descending)
Query scope: Collection
```

### **credits**
```
Collection ID: credits
Fields:
  - userId (Ascending)
  - date (Descending)
Query scope: Collection
```

---

## 📊 Métricas y KPIs

### **Compras**

1. **Inversión Total**
   - Suma de todas las inversiones
   - Formula: `Σ investment`

2. **Ganancia Total**
   - Suma de todas las ganancias
   - Formula: `Σ profit`

3. **ROI Promedio**
   - Retorno promedio sobre inversión
   - Formula: `(Ganancia Total / Inversión Total) × 100`

### **Créditos**

1. **Capital Prestado**
   - Total de dinero prestado
   - Formula: `Σ principalAmount`

2. **Total Recuperado**
   - Dinero cobrado hasta la fecha
   - Formula: `Σ totalPaid`

3. **Saldo Pendiente**
   - Dinero aún por cobrar
   - Formula: `Σ remainingBalance`

4. **Tasa de Recuperación**
   - Porcentaje recuperado
   - Formula: `(Recuperado / Total a Cobrar) × 100`

---

## 🎨 Colores y Estados

### **Estados de Crédito**

| Estado      | Color       | Badge         | Condición                      |
|-------------|-------------|---------------|--------------------------------|
| Activo      | Azul        | ⏳ Activo     | Tiene cuotas pendientes        |
| Completado  | Verde       | ✅ Completado | Todas las cuotas pagadas       |
| Moroso      | Rojo        | ❌ Moroso     | (Futuro: cuotas vencidas)      |

### **Estados de Cuota**

| Estado     | Color       | Badge | Descripción                   |
|------------|-------------|-------|-------------------------------|
| Pagado     | Verde claro | ✅    | Cuota marcada como pagada     |
| Pendiente  | Amarillo    | ⏳    | Cuota aún no pagada           |

### **Indicadores de ROI**

| ROI          | Color  | Badge      |
|--------------|--------|------------|
| Positivo     | Verde  | +21.4%     |
| Negativo     | Rojo   | -5.2%      |

---

## 🔔 Validaciones

### **Compras**
- ✅ Producto no puede estar vacío
- ✅ Inversión debe ser mayor a 0
- ✅ Precio de venta debe ser mayor a 0
- ✅ Fecha es requerida
- ✅ Descripción es opcional

### **Créditos**
- ✅ Cliente no puede estar vacío
- ✅ Capital debe ser mayor a 0
- ✅ Tasa de interés debe ser >= 0
- ✅ Número de cuotas debe ser >= 1
- ✅ Fecha es requerida
- ✅ Descripción es opcional

---

## 🚀 Funcionalidades Futuras

### **Fase 1: Reportes**
- [ ] Exportar compras a PDF/Excel
- [ ] Exportar créditos a PDF/Excel
- [ ] Gráfica de ROI en el tiempo
- [ ] Comparativa de inversiones

### **Fase 2: Notificaciones**
- [ ] Alertas de cuotas próximas a vencer
- [ ] Recordatorios de pagos atrasados
- [ ] Notificaciones de créditos completados

### **Fase 3: Análisis Avanzado**
- [ ] Dashboard de inversiones
- [ ] Mejores y peores inversiones
- [ ] Proyecciones de ingresos
- [ ] Análisis de rentabilidad por tipo

### **Fase 4: Funcionalidades Extra**
- [ ] Categorías de compras
- [ ] Estados personalizados para créditos
- [ ] Pagos parciales de cuotas
- [ ] Histórico de cambios
- [ ] Notas por cuota
- [ ] Archivos adjuntos (contratos, recibos)

---

## 📂 Estructura de Archivos

```
src/
├── components/
│   └── Investments/
│       ├── Investments.jsx      (~750 líneas)
│       └── Investments.css      (~850 líneas)
├── hooks/
│   └── useInvestments.js        (~320 líneas)
└── firebase/
    └── config.js                (configuración)
```

---

## 🔧 API del Hook `useInvestments`

### **Estado**
```javascript
const {
  purchases,           // Array de compras
  credits,             // Array de créditos
  loading,             // Boolean de carga
  error,               // String de error
  
  // Métodos de compras
  addPurchase,         // Agregar compra
  updatePurchase,      // Actualizar compra
  deletePurchase,      // Eliminar compra
  
  // Métodos de créditos
  addCredit,           // Agregar crédito
  updateCredit,        // Actualizar crédito
  deleteCredit,        // Eliminar crédito
  
  // Métodos de cuotas
  markInstallmentAsPaid,    // Marcar cuota como pagada
  markInstallmentAsUnpaid   // Desmarcar cuota
} = useInvestments(userId);
```

### **Métodos**

#### `addPurchase(purchaseData)`
```javascript
await addPurchase({
  productName: "Laptop",
  investment: 800,
  salePrice: 1000,
  date: new Date(),
  description: "..."
});
// Retorna: { success: true } o { success: false, error: "..." }
```

#### `addCredit(creditData)`
```javascript
await addCredit({
  clientName: "Juan",
  principalAmount: 2000,
  interestRate: 10,
  installments: 12,
  date: new Date(),
  description: "..."
});
// Retorna: { success: true } o { success: false, error: "..." }
```

#### `markInstallmentAsPaid(creditId, installmentNumber)`
```javascript
await markInstallmentAsPaid("credit123", 1);
// Marca la cuota #1 como pagada
// Actualiza automáticamente: paidInstallments, totalPaid, remainingBalance, status
```

---

## ⚡ Performance

### **Optimizaciones Implementadas**
- ✅ Consultas con índices (`userId` + `date`)
- ✅ Suscripciones en tiempo real con `onSnapshot`
- ✅ Cálculos del lado del cliente (ROI, cuotas)
- ✅ Validaciones antes de enviar a Firestore
- ✅ Actualización reactiva del UI

### **Límites Recomendados**
- **Compras**: Sin límite práctico
- **Créditos**: Máximo 100 activos simultáneos
- **Cuotas por Crédito**: Máximo 60 cuotas (5 años)

---

## 📱 Responsive Design

### **Desktop (>768px)**
- Tablas completas con todas las columnas
- Modales centrados (max-width: 600px)
- Grid de 3 columnas para resumen

### **Mobile (<768px)**
- Tablas con scroll horizontal
- Modales full-width
- Grid de 1 columna para resumen
- Pestañas solo con iconos
- Botones full-width en formularios

---

## 🎯 Casos de Uso Reales

### **Caso 1: Negocio de Compra-Venta de Electrónicos**
```
Compras:
- Laptop Dell ($800 → $1,000) = +$200 (25% ROI)
- iPhone 13 ($700 → $850) = +$150 (21.4% ROI)
- iPad Pro ($600 → $720) = +$120 (20% ROI)

Total Invertido: $2,100
Ganancia Total: $470
ROI Promedio: 22.4%
```

### **Caso 2: Prestamista Personal**
```
Créditos Activos:
- Juan Pérez: $2,000 al 10% en 12 cuotas
  → 4 cuotas pagadas ($733.33)
  → 8 cuotas pendientes ($1,466.67)
  
- María González: $1,500 al 8% en 6 cuotas
  → 2 cuotas pagadas ($270)
  → 4 cuotas pendientes ($540)

Total Prestado: $3,500
Total Recuperado: $1,003.33
Pendiente: $2,006.67
Tasa de Recuperación: 28.7%
```

---

## ✅ Checklist de Implementación

- ✅ Hook `useInvestments` creado
- ✅ Componente `Investments.jsx` funcional
- ✅ Estilos `Investments.css` completos
- ✅ Integración en Dashboard
- ✅ Navegación en Sidebar
- ✅ Formularios de Compras
- ✅ Formularios de Créditos
- ✅ Tablas responsivas
- ✅ Modal de cuotas
- ✅ Sistema de marcar pagos
- ✅ Cálculos automáticos
- ✅ Validaciones
- ✅ Estados visuales
- ✅ Empty states
- ✅ Confirmaciones de eliminación

---

## 🎉 Estado Actual

**Versión:** 1.0.0  
**Estado:** ✅ Producción  
**Última actualización:** Octubre 2025

### **Funcionalidades 100% Operativas:**
- ✅ Registro de compras con ROI
- ✅ Registro de créditos con cuotas
- ✅ Sistema de seguimiento de pagos
- ✅ Edición y eliminación
- ✅ Métricas en tiempo real
- ✅ Interfaz responsive
- ✅ Persistencia en Firebase

---

¡La vista de Inversiones está lista para usar! 💎🚀
