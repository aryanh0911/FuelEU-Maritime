import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes } from './routes';

// Import repositories
import { PostgresRouteRepository } from '../../adapters/outbound/postgres/route.repository.impl';
import { PostgresComplianceRepository } from '../../adapters/outbound/postgres/compliance.repository.impl';
import { PostgresBankingRepository } from '../../adapters/outbound/postgres/banking.repository.impl';
import { PostgresPoolingRepository } from '../../adapters/outbound/postgres/pooling.repository.impl';

// Import use cases
import {
  GetAllRoutesUseCase,
  SetBaselineUseCase,
  GetRouteComparisonUseCase,
  GetRoutesByFiltersUseCase,
} from '../../core/application/routes.use-cases';
import {
  ComputeComplianceBalanceUseCase,
  GetAdjustedCBUseCase,
} from '../../core/application/compliance.use-cases';
import {
  BankSurplusUseCase,
  ApplyBankedSurplusUseCase,
  GetBankingRecordsUseCase,
} from '../../core/application/banking.use-cases';
import { CreatePoolUseCase } from '../../core/application/pooling.use-cases';

// Import controllers
import { RouteController } from '../../adapters/inbound/http/route.controller';
import { ComplianceController } from '../../adapters/inbound/http/compliance.controller';
import { BankingController } from '../../adapters/inbound/http/banking.controller';
import { PoolingController } from '../../adapters/inbound/http/pooling.controller';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Initialize repositories
  const routeRepository = new PostgresRouteRepository();
  const complianceRepository = new PostgresComplianceRepository();
  const bankingRepository = new PostgresBankingRepository();
  const poolingRepository = new PostgresPoolingRepository();

  // Initialize use cases
  const getAllRoutesUseCase = new GetAllRoutesUseCase(routeRepository);
  const setBaselineUseCase = new SetBaselineUseCase(routeRepository);
  const getRouteComparisonUseCase = new GetRouteComparisonUseCase(routeRepository);
  const getRoutesByFiltersUseCase = new GetRoutesByFiltersUseCase(routeRepository);

  const computeComplianceBalanceUseCase = new ComputeComplianceBalanceUseCase(
    complianceRepository,
    routeRepository
  );
  const getAdjustedCBUseCase = new GetAdjustedCBUseCase(complianceRepository);

  const bankSurplusUseCase = new BankSurplusUseCase(bankingRepository, complianceRepository);
  const applyBankedSurplusUseCase = new ApplyBankedSurplusUseCase(
    bankingRepository,
    complianceRepository
  );
  const getBankingRecordsUseCase = new GetBankingRecordsUseCase(bankingRepository);

  const createPoolUseCase = new CreatePoolUseCase(poolingRepository);

  // Initialize controllers
  const routeController = new RouteController(
    getAllRoutesUseCase,
    setBaselineUseCase,
    getRouteComparisonUseCase,
    getRoutesByFiltersUseCase
  );

  const complianceController = new ComplianceController(
    computeComplianceBalanceUseCase,
    getAdjustedCBUseCase
  );

  const bankingController = new BankingController(
    bankSurplusUseCase,
    applyBankedSurplusUseCase,
    getBankingRecordsUseCase
  );

  const poolingController = new PoolingController(createPoolUseCase);

  // Setup routes
  const routes = createRoutes(routeController, complianceController, bankingController, poolingController);
  app.use('/api', routes);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
