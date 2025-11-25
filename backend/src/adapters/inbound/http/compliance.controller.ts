import { Request, Response } from 'express';
import {
  ComputeComplianceBalanceUseCase,
  GetAdjustedCBUseCase,
} from '../../../core/application/compliance.use-cases';

export class ComplianceController {
  constructor(
    private computeComplianceBalanceUseCase: ComputeComplianceBalanceUseCase,
    private getAdjustedCBUseCase: GetAdjustedCBUseCase
  ) {}

  getComplianceBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const cb = await this.computeComplianceBalanceUseCase.execute({
        shipId: shipId as string,
        year: parseInt(year as string),
      });

      res.json(cb);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAdjustedCB = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const adjustedCB = await this.getAdjustedCBUseCase.execute(
        shipId as string,
        parseInt(year as string)
      );

      res.json(adjustedCB);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
