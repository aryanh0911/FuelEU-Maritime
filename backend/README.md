# FuelEU Maritime Backend

Backend API for the FuelEU Maritime Compliance Platform, built with Node.js, TypeScript, PostgreSQL, and Hexagonal Architecture.

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters / Clean Architecture):

```
src/
├── core/                      # Business logic (framework-independent)
│   ├── domain/                # Entities and domain models
│   ├── application/           # Use cases (business logic)
│   └── ports/                 # Interfaces for external adapters
│       └── outbound/          # Repository interfaces
├── adapters/                  # Implementations of ports
│   ├── inbound/              # Entry points (HTTP controllers)
│   │   └── http/
│   └── outbound/             # Data persistence implementations
│       └── postgres/
├── infrastructure/            # Framework-specific code
│   ├── db/                   # Database connection & migrations
│   │   ├── migrations/
│   │   └── seeds/
│   └── server/               # Express server setup
└── shared/                   # Shared utilities

```

### Key Principles

- **Core** has no dependencies on frameworks or external libraries
- **Adapters** implement the interfaces defined in **Ports**
- **Infrastructure** handles framework setup and cross-cutting concerns
- Dependencies flow inward: Infrastructure → Adapters → Core

## 🚀 Setup & Installation

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation Steps

1. **Clone the repository**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

4. **Setup database**

```bash
# Create database
createdb fueleu_db

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

5. **Run the server**

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## 📡 API Endpoints

### Routes

```
GET    /api/routes                    # Get all routes
GET    /api/routes?vesselType=...&fuelType=...&year=...  # Filter routes
POST   /api/routes/:id/baseline       # Set a route as baseline
GET    /api/routes/comparison         # Compare all routes vs baseline
```

### Compliance

```
GET    /api/compliance/cb?shipId=...&year=...          # Get/compute compliance balance
GET    /api/compliance/adjusted-cb?shipId=...&year=... # Get adjusted CB (after banking)
```

### Banking

```
GET    /api/banking/records?shipId=...&year=...  # Get banking records
POST   /api/banking/bank                         # Bank positive CB
       Body: { shipId, year, amountGco2eq }
POST   /api/banking/apply                        # Apply banked surplus
       Body: { shipId, year, amountGco2eq }
```

### Pooling

```
POST   /api/pools                                # Create a pool
       Body: { 
         year: 2025,
         members: [
           { shipId: "R001", cbBefore: 1000 },
           { shipId: "R002", cbBefore: -500 }
         ]
       }
```

## 🧮 Core Formulas

### Compliance Balance (CB)

```
Energy in Scope = Fuel Consumption (tonnes) × 41,000 MJ/tonne
CB (gCO2eq) = (Target Intensity - Actual Intensity) × Energy in Scope
```

### Target Intensity (2025)

```
91.16 gCO2e/MJ × (1 - 0.02) = 89.3368 gCO2e/MJ
```

- Positive CB → Surplus
- Negative CB → Deficit

### Pooling Algorithm

Greedy allocation:
1. Sort members by CB descending (surplus ships first)
2. Transfer surplus from positive CB ships to negative CB ships
3. Validate constraints:
   - Sum(CB) ≥ 0
   - Deficit ship cannot exit worse than before
   - Surplus ship cannot exit negative

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Structure

- Unit tests: `src/core/application/__tests__/`
- Integration tests: Test HTTP endpoints with Supertest

## 🗄️ Database Schema

### Tables

**routes**
- Stores vessel route data (fuel type, GHG intensity, consumption, etc.)
- One route can be marked as baseline (`is_baseline`)

**ship_compliance**
- Computed compliance balance per ship per year
- Stores CB, target intensity, actual intensity, energy in scope

**bank_entries**
- Records of banked surplus amounts
- Multiple entries per ship/year allowed

**pools**
- Pool registry by year

**pool_members**
- Ships participating in a pool
- Records CB before and after pooling

## 📊 Sample Data

The seed script (`npm run db:seed`) loads 5 routes:

| Route ID | Vessel Type  | Fuel Type | Year | GHG Intensity | Fuel Consumption | Distance | Total Emissions |
|----------|--------------|-----------|------|---------------|------------------|----------|-----------------|
| R001     | Container    | HFO       | 2024 | 91.0          | 5000 t           | 12000 km | 4500 t          |
| R002     | BulkCarrier  | LNG       | 2024 | 88.0          | 4800 t           | 11500 km | 4200 t          |
| R003     | Tanker       | MGO       | 2024 | 93.5          | 5100 t           | 12500 km | 4700 t          |
| R004     | RoRo         | HFO       | 2025 | 89.2          | 4900 t           | 11800 km | 4300 t          |
| R005     | Container    | LNG       | 2025 | 90.5          | 4950 t           | 11900 km | 4400 t          |

**R001 is set as the baseline by default.**

## 🛠️ Development

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

### Adding New Features

1. Define domain model in `src/core/domain/`
2. Create use case in `src/core/application/`
3. Define repository interface in `src/core/ports/outbound/`
4. Implement repository in `src/adapters/outbound/postgres/`
5. Create controller in `src/adapters/inbound/http/`
6. Register routes in `src/infrastructure/server/routes.ts`
7. Add tests

## 🔐 Environment Variables

| Variable                | Description                      | Default      |
|-------------------------|----------------------------------|--------------|
| DATABASE_URL            | PostgreSQL connection string     | -            |
| DB_HOST                 | Database host                    | localhost    |
| DB_PORT                 | Database port                    | 5432         |
| DB_USER                 | Database user                    | postgres     |
| DB_PASSWORD             | Database password                | postgres     |
| DB_NAME                 | Database name                    | fueleu_db    |
| PORT                    | Server port                      | 3000         |
| NODE_ENV                | Environment (dev/prod)           | development  |
| TARGET_INTENSITY_2025   | Target GHG intensity for 2025    | 89.3368      |

## 📝 License

MIT

---

## 🤖 AI Agent Usage

See `AGENT_WORKFLOW.md` for details on how AI agents (GitHub Copilot, Claude Code, Cursor) were used to build this project.

## 💭 Reflection

See `REFLECTION.md` for insights on efficiency gains and lessons learned using AI agents.
