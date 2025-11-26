# FuelEU Maritime Frontend

React + TypeScript + TailwindCSS dashboard for FuelEU Maritime compliance management.

## Architecture

This frontend follows **Hexagonal Architecture** (Ports & Adapters):

```
src/
├── core/                      # Business logic (React-independent)
│   ├── domain/                # Domain models and types
│   └── ports/                 # Interfaces for external adapters
│       └── outbound/          # Repository interfaces
├── adapters/                  # Implementations of ports
│   ├── ui/                   # React components (inbound)
│   │   ├── pages/            # Page components
│   │   └── components/       # Feature components
│   ├── outbound/             # API clients
│   └── infrastructure/       # Framework-specific code
└── main.tsx                  # Application entry point
```

### Key Principles

- **Core** has no React dependencies
- **Domain models** are framework-agnostic
- **UI components** implement inbound ports
- **API clients** implement outbound ports
- **Clean separation** of concerns

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Access the application at `http://localhost:5173`

## Features

### 1. Routes Tab

Display and manage maritime routes:

- **Table View:** All routes with comprehensive details
- **Filters:** By vessel type, fuel type, and year
- **Baseline Management:** Set any route as baseline for comparisons
- **Data Display:**
  - Route ID
  - Vessel type
  - Fuel type
  - Year
  - GHG intensity (gCO₂e/MJ)
  - Fuel consumption (tonnes)
  - Distance (km)
  - Total emissions (tonnes)
  - Baseline indicator

**Key Feature:** Dynamic filtering updates the table in real-time

### 2. Compare Tab

Compare routes against baseline:

- **Baseline Info:** Display current baseline route and target intensity
- **Interactive Chart:** Bar chart comparing GHG intensities
  - Baseline values (blue)
  - Comparison values (green)
  - Target intensity (red)
- **Comparison Table:**
  - Route ID
  - GHG Intensity
  - Percentage difference from baseline
  - Compliance status (✓ compliant / ✗ non-compliant)

**Formula:** `percentDiff = ((comparison / baseline) - 1) × 100`

**Target:** 89.3368 gCO₂e/MJ (2% below 91.16)

### 3. Banking Tab

Implement FuelEU Article 20 - Banking:

- **CB Lookup:** Load compliance balance by ship ID and year
- **Bank Surplus:** Bank positive compliance balance for future use
- **Apply Banked:** Apply previously banked surplus to deficits
- **KPIs Display:**
  - Current CB (color-coded: green for surplus, red for deficit)
  - Before/After values for banking operations
  - Applied amount confirmation

**Validation:**
- Cannot bank negative or zero CB
- Cannot apply more than available banked amount
- Errors displayed with clear messages

### 4. Pooling Tab

Implement FuelEU Article 21 - Pooling:

- **Pool Creation:** Add multiple ships to a pool
- **Member Management:**
  - Add/remove pool members
  - Specify ship ID and CB before pooling
- **Real-time Validation:**
  - Pool sum calculation
  - Visual indicators (green = valid, red = invalid)
  - Create button disabled if invalid
- **Results Display:**
  - CB before and after for each member
  - Change amount (+ or -)
  - Final pool sum

**Rules Enforced:**
- Sum(CB) must be ≥ 0
- Deficit ships cannot exit worse
- Surplus ships cannot exit negative
- Greedy allocation algorithm

## Component Structure

### Pages

**Dashboard**
- Main layout with header and navigation
- Tab-based routing
- Responsive design

### Components

**RoutesTab**
- Fetches routes from API
- Implements filters
- Handles baseline setting

**CompareTab**
- Fetches comparison data
- Renders bar chart with Recharts
- Displays compliance status

**BankingTab**
- Form for CB operations
- Banking action handlers
- Result display

**PoolingTab**
- Dynamic member list
- Pool validation
- Results table

## Styling

Uses **TailwindCSS** for styling:

- **Utility-first:** Compose styles from utility classes
- **Responsive:** Mobile-first responsive design
- **Customizable:** Extended color palette
- **Consistent:** Design system across all components

### Color Scheme

- **Primary:** Blue (#3b82f6) - Actions, links
- **Success:** Green (#10b981) - Compliant, surplus
- **Danger:** Red (#ef4444) - Non-compliant, deficit
- **Neutral:** Gray shades - Text, backgrounds

## API Integration

### HTTP Client

`src/adapters/infrastructure/api-client.ts`

- Generic REST client
- Error handling
- JSON serialization
- Type-safe responses

### Repositories

Implement outbound ports for data access:

- **HttpRouteRepository:** Route operations
- **HttpComplianceRepository:** Compliance balance
- **HttpBankingRepository:** Banking operations
- **HttpPoolingRepository:** Pool creation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run in watch mode
npm test:watch
```

### Test Structure

- Unit tests for use cases
- Component tests for UI
- Integration tests for API clients

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
2. Create repository interface in `src/core/ports/outbound/`
3. Implement API client in `src/adapters/outbound/`
4. Create UI component in `src/adapters/ui/components/`
5. Add route in Dashboard if needed

## 🔧 Configuration

### Vite Config

- React plugin
- Path aliases (`@/` → `src/`)
- Proxy to backend API
- Port 5173

### TypeScript

- Strict mode enabled
- Path mapping configured
- JSX: react-jsx

### TailwindCSS

- JIT mode
- Responsive utilities
- Custom color palette

## 📦 Build & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Output: `dist/` directory

### Environment Variables

`.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Note:** Vite only exposes variables prefixed with `VITE_`

## 🎯 User Experience

### Loading States

- Spinner/loading message during data fetch
- Disabled buttons during operations
- Error messages for failures

### Error Handling

- Clear error messages
- Color-coded alerts (red background)
- Network error handling

### Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Tables scroll horizontally on mobile
- Stacked forms on small screens

## 🔒 Data Flow

```
User Action
    ↓
UI Component (adapters/ui)
    ↓
Repository Interface (core/ports)
    ↓
HTTP Client (adapters/outbound)
    ↓
Backend API
    ↓
Response flows back up
```

## 📊 Key Metrics

- **Components:** 4 main feature components + Dashboard
- **Domain Models:** 4 (Route, Compliance, Banking, Pooling)
- **Repository Interfaces:** 4
- **API Clients:** 4 implementations
- **Lines of Code:** ~1,500+ (excluding configs)

## 🤖 AI-Assisted Development

Components generated with **GitHub Copilot**:

- Boilerplate React components (saved ~3-4 hours)
- TailwindCSS styling (saved ~2 hours)
- API client structure (saved ~1 hour)
- Type definitions (saved ~1 hour)

**Manual Work:**
- Domain logic validation
- Complex state management
- Business rule implementation
- UI/UX decisions

See `AGENT_WORKFLOW.md` for details.

## 📚 Dependencies

### Production

- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Routing
- `recharts` - Charting library
- `zod` - Runtime validation

### Development

- `vite` - Build tool
- `typescript` - Type safety
- `tailwindcss` - Styling
- `eslint` - Linting
- `prettier` - Formatting
- `vitest` - Testing

## 🚧 Known Limitations

- No authentication/authorization
- No persistent state (Redux/Context)
- Basic error handling
- Limited offline support
- No caching strategy

## 🔮 Future Enhancements

- [ ] User authentication
- [ ] Real-time updates (WebSocket)
- [ ] Advanced filtering
- [ ] Export to CSV/PDF
- [ ] Dark mode
- [ ] More chart types
- [ ] Accessibility improvements
- [ ] Progressive Web App (PWA)

## 📖 Resources

- [React Documentation](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 License

MIT

---

For backend documentation, see `../backend/README.md`
