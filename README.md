# 🏡 Homie E-Commerce — Plataforma Monorepo

Plataforma e-commerce para venta de artículos de hogar, menaje, mugs de colección y termos inteligentes en Colombia, con modelo de reabastecimiento consolidado con proveedores en Bogotá.

---

## 🏛️ Arquitectura del Sistema

- **Backend:** Node.js + TypeScript + Express en arquitectura por capas (`Routes` -> `Controllers` -> `Services` -> `Repositories`).
- **Base de Datos:** Azure Database for PostgreSQL (`db-homie`) con triggers automáticos de timestamp y vista financiera calculada `v_order_financial_summary`.
- **Frontend:** Angular 18 (Standalone Components, Signals reactivos para carrito y estado, Reactive Forms, Tailwind CSS).
- **Modelo de Pagos:** Diseñado para Colombia (Contraentrega, Nequi/Daviplata, PSE/Wompi).

---

## 📦 Estructura del Monorepo

```
Homie/
├── Untitled-1.sql             # Script DDL completo de PostgreSQL
├── package.json               # Monorepo scripts raíz
│
├── backend/                   # API REST Express + TypeScript
│   ├── src/
│   │   ├── config/database.ts # Conexión pg Pool con soporte SSL
│   │   ├── types/index.ts     # Contratos e Interfaces TypeScript 1:1
│   │   ├── repositories/      # Acceso a base de datos PostgreSQL
│   │   ├── services/          # Lógica de negocio y validación
│   │   ├── controllers/       # Manejadores de solicitudes HTTP
│   │   ├── routes/            # Definición de rutas REST /api
│   │   ├── middleware/        # Error handler y validación con express-validator
│   │   ├── scripts/           # init-db.ts y seed.ts
│   │   └── server.ts          # Entry point del servidor
│   └── package.json
│
└── frontend/                  # Aplicación Angular 18 Standalone
    ├── src/
    │   ├── app/
    │   │   ├── core/          # ApiService, CartService, State Services con Signals
    │   │   ├── layouts/       # StoreLayoutComponent y AdminLayoutComponent
    │   │   ├── features/      # Catalog, ProductDetail, Checkout, Admin Views
    │   │   └── shared/        # ProductCard, CartSidebar, StatusBadge, Pipes
    │   ├── environments/      # environment.ts y environment.prod.ts
    │   └── styles.css         # Directivas de Tailwind CSS
    └── package.json
```

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
- Node.js >= 18
- Base de Datos PostgreSQL activa (local o Azure PostgreSQL)

### 2. Configuración de Variables de Entorno
Configurar `backend/.env`:
```env
DATABASE_URL=postgresql://usuario:password@db-homie.postgres.database.azure.com:5432/homiedb
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
```

### 3. Inicializar Base de Datos y Sembrar Datos de Prueba
```powershell
# Ejecutar esquema DDL:
npm run db:init

# Sembrar categorías, productos con variantes, clientes y órdenes de prueba:
npm run seed
```

### 4. Ejecutar Servidores en Desarrollo
```powershell
# En una terminal para el Backend:
npm run dev:backend

# En otra terminal para el Frontend:
npm run dev:frontend
```

Acceder en el navegador:
- **Tienda Pública:** [http://localhost:4200](http://localhost:4200)
- **Panel Administrativo:** [http://localhost:4200/admin](http://localhost:4200/admin)
- **API Health Check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 💼 Reglas de Negocio Implementadas

1. **Snapshots de Costos e Inmutabilidad:** Al realizar una orden, el precio de venta (`unit_price`) y el costo mayorista (`unit_cost`) se leen directamente de la base de datos y se congelan en `order_items` para cálculo histórico fidedigno de utilidades.
2. **Deducción Inmediata de Stock:** Las órdenes descuentan el inventario de la variante seleccionada dentro de la misma transacción atómica.
3. **Lógica de Proveedor Mayorista (Bogotá):**
   - Mínimo de 12 unidades en total para la consolidación y apertura de un lote en `supplier_batches`.
   - Mínimo de 3 unidades para reposición por cada variante individual.
4. **Clientes Recurrentes:** Se realiza UPSERT por número telefónico (`phone`) para mantener historial unificado.
