import { Request, Response } from 'express';
import { CreatePoolUseCase } from '../../../core/application/pooling.use-cases';

export class PoolingController {
  constructor(private createPoolUseCase: CreatePoolUseCase) {}

  createPool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year, members } = req.body;

      if (!year || !members || !Array.isArray(members)) {
        res.status(400).json({ error: 'year and members array are required' });
        return;
      }

      const result = await this.createPoolUseCase.execute({
        year: parseInt(year),
        members: members.map((m: { shipId: string; cbBefore: string | number }) => ({
          shipId: m.shipId,
          cbBefore: typeof m.cbBefore === 'string' ? parseFloat(m.cbBefore) : m.cbBefore,
        })),
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
