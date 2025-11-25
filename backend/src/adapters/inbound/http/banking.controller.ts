import { Request, Response } from 'express';
import {
  BankSurplusUseCase,
  ApplyBankedSurplusUseCase,
  GetBankingRecordsUseCase,
} from '../../../core/application/banking.use-cases';

export class BankingController {
  constructor(
    private bankSurplusUseCase: BankSurplusUseCase,
    private applyBankedSurplusUseCase: ApplyBankedSurplusUseCase,
    private getBankingRecordsUseCase: GetBankingRecordsUseCase
  ) {}

  getBankingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year } = req.query;

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const records = await this.getBankingRecordsUseCase.execute(
        shipId as string,
        parseInt(year as string)
      );

      res.json(records);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  bankSurplus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year, amountGco2eq } = req.body;

      if (!shipId || !year || amountGco2eq === undefined) {
        res.status(400).json({ error: 'shipId, year, and amountGco2eq are required' });
        return;
      }

      const entry = await this.bankSurplusUseCase.execute({
        shipId,
        year: parseInt(year),
        amountGco2eq: parseFloat(amountGco2eq),
      });

      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  applyBanked = async (req: Request, res: Response): Promise<void> => {
    try {
      const { shipId, year, amountGco2eq } = req.body;

      if (!shipId || !year || amountGco2eq === undefined) {
        res.status(400).json({ error: 'shipId, year, and amountGco2eq are required' });
        return;
      }

      const result = await this.applyBankedSurplusUseCase.execute({
        shipId,
        year: parseInt(year),
        amountGco2eq: parseFloat(amountGco2eq),
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
