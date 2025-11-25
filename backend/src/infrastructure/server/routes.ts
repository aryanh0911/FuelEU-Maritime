import { Router } from 'express';
import { RouteController } from '../adapters/inbound/http/route.controller';
import { ComplianceController } from '../adapters/inbound/http/compliance.controller';
import { BankingController } from '../adapters/inbound/http/banking.controller';
import { PoolingController } from '../adapters/inbound/http/pooling.controller';

export function createRoutes(
  routeController: RouteController,
  complianceController: ComplianceController,
  bankingController: BankingController,
  poolingController: PoolingController
): Router {
  const router = Router();

  // Routes
  router.get('/routes', routeController.getAllRoutes);
  router.post('/routes/:id/baseline', routeController.setBaseline);
  router.get('/routes/comparison', routeController.getComparison);

  // Compliance
  router.get('/compliance/cb', complianceController.getComplianceBalance);
  router.get('/compliance/adjusted-cb', complianceController.getAdjustedCB);

  // Banking
  router.get('/banking/records', bankingController.getBankingRecords);
  router.post('/banking/bank', bankingController.bankSurplus);
  router.post('/banking/apply', bankingController.applyBanked);

  // Pooling
  router.post('/pools', poolingController.createPool);

  return router;
}
