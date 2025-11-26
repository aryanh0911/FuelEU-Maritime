# FuelEU Maritime Compliance Platform

A full-stack TypeScript application for managing FuelEU Maritime compliance, including route tracking, compliance balance calculations, banking, and pooling. Built with hexagonal architecture.

## Project Structure

```
.
├── backend/                 # Node.js + TypeScript + PostgreSQL backend
│   ├── src/
│   │   ├── core/           # Domain models, use cases, ports
│   │   ├── adapters/       # HTTP controllers, database repositories
│   │   └── infrastructure/ # Server, database, migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend/               # React + TypeScript + TailwindCSS frontend
│   ├── src/
│   │   ├── core/          # Domain models, ports
│   │   ├── adapters/      # UI components, API clients
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── AGENT_WORKFLOW.md       # AI agent usage documentation
├── REFLECTION.md           # Development insights and learnings
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Create database
createdb fueleu_db

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Architecture

Both frontend and backend follow **Hexagonal Architecture** (Ports & Adapters):

```
Application Core (Domain + Use Cases)
         ↑
    Ports (Interfaces)
         ↑
   Adapters (Implementations)
         ↑
Infrastructure (Framework-specific code)
```

### Key Principles

- **Core has no dependencies** on frameworks or external libraries
- **Dependency Inversion:** Dependencies point inward
- **Clear boundaries** between layers
- **Testable** business logic

## Features

### 1. Routes Management
- Display all maritime routes with detailed information
- Filter by vessel type, fuel type, and year
- Set baseline routes for comparison
- View GHG intensity, fuel consumption, distance, emissions

### 2. Route Comparison
- Compare all routes against baseline
- Calculate percentage differences
- Visualize with interactive charts
- Check compliance against target intensity (89.3368 gCO₂e/MJ)

### 3. Banking (Article 20)
- Calculate compliance balance (CB) for ships
- Bank positive surplus for future use
- Apply banked surplus to deficits
- Track banking history

### 4. Pooling (Article 21)
- Create pools of ships to share compliance balance
- Greedy algorithm for optimal surplus allocation
- Validate pool rules:
  - Sum of CB must be ≥ 0
  - Deficit ships cannot exit worse
  - Surplus ships cannot exit negative

## Core Calculations

### Compliance Balance (CB)

```
Energy in Scope (MJ) = Fuel Consumption (tonnes) × 41,000 MJ/tonne
CB (gCO₂eq) = (Target Intensity - Actual Intensity) × Energy in Scope
```

### Target Intensity (2025)

```
91.16 gCO₂e/MJ × (1 - 0.02) = 89.3368 gCO₂e/MJ
```

- **Positive CB** = Surplus
- **Negative CB** = Deficit

## Sample Data

The application includes 5 pre-seeded routes:

| Route | Vessel | Fuel | Year | GHG Intensity | Fuel Consumption | Distance | Emissions |
|-------|--------|------|------|---------------|------------------|----------|-----------|
| R001  | Container | HFO | 2024 | 91.0 | 5000 t | 12000 km | 4500 t |
| R002  | BulkCarrier | LNG | 2024 | 88.0 | 4800 t | 11500 km | 4200 t |
| R003  | Tanker | MGO | 2024 | 93.5 | 5100 t | 12500 km | 4700 t |
| R004  | RoRo | HFO | 2025 | 89.2 | 4900 t | 11800 km | 4300 t |
| R005  | Container | LNG | 2025 | 90.5 | 4950 t | 11900 km | 4400 t |

**R001 is set as the baseline by default.**

## Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Endpoints

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes?vesselType=...&fuelType=...&year=...` - Filter routes
- `POST /api/routes/:id/baseline` - Set baseline
- `GET /api/routes/comparison` - Compare vs baseline

### Compliance
- `GET /api/compliance/cb?shipId=...&year=...` - Get compliance balance
- `GET /api/compliance/adjusted-cb?shipId=...&year=...` - Get adjusted CB

### Banking
- `GET /api/banking/records?shipId=...&year=...` - Get records
- `POST /api/banking/bank` - Bank surplus
- `POST /api/banking/apply` - Apply banked

### Pooling
- `POST /api/pools` - Create pool

See individual READMEs for detailed API documentation.

## Development Documentation

For detailed information about the development process and technical decisions:

### [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md)
Comprehensive documentation of:
### [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md)
Documentation of development workflow including:
- Tools and technologies used
- Implementation approach for key features
- Technical decisions and validations
- Development best practices

### [REFLECTION.md](./REFLECTION.md)
Technical insights including:
- Architectural decisions
- Development efficiency analysis
- Quality considerations
- Future improvements

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Architecture:** Hexagonal (Ports & Adapters)
- **Testing:** Jest + Supertest
- **Validation:** Zod

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Build Tool:** Vite
- **Router:** React Router v6
- **Architecture:** Hexagonal (Ports & Adapters)

## Reference Materials

This implementation follows:
- **FuelEU Maritime Regulation (EU) 2023/1805**
- Annex IV: Calculation methodologies
- Article 20: Banking
- Article 21: Pooling

Target intensities and formulas are based on official FuelEU specifications.

## Development

### Code Quality

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fueleu_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fueleu_db
PORT=3000
NODE_ENV=development
TARGET_INTENSITY_2025=89.3368
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Contributing

This is an assignment project. For similar projects:

1. Fork the repository
2. Create a feature branch
3. Follow the hexagonal architecture pattern
4. Write tests for new features
5. Submit a pull request

## License

MIT License - see individual package files for details.

## Author

Created as part of the Varuna Marine Full-Stack Developer Assignment.

## Acknowledgments

- FuelEU Maritime Regulation for domain specifications
- Clean Architecture principles by Robert C. Martin
- Hexagonal Architecture by Alistair Cockburn

## Project Stats

- Lines of Code: ~3,500+ (excluding tests and configurations)
- Development Time: ~26-32 hours
- Test Coverage: Core business logic comprehensively tested
- Architecture: Fully hexagonal, framework-independent core

For detailed setup instructions, see the README files in `/backend` and `/frontend` directories.
