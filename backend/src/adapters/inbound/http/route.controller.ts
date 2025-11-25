import { Request, Response } from 'express';
import {
  GetAllRoutesUseCase,
  SetBaselineUseCase,
  GetRouteComparisonUseCase,
  GetRoutesByFiltersUseCase,
} from '../../../core/application/routes.use-cases';

export class RouteController {
  constructor(
    private getAllRoutesUseCase: GetAllRoutesUseCase,
    private setBaselineUseCase: SetBaselineUseCase,
    private getRouteComparisonUseCase: GetRouteComparisonUseCase,
    private getRoutesByFiltersUseCase: GetRoutesByFiltersUseCase
  ) {}

  getAllRoutes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const routes = await this.getAllRoutesUseCase.execute();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getRoutesByFilters = async (req: Request, res: Response): Promise<void> => {
    try {
      const { vesselType, fuelType, year } = req.query;
      const routes = await this.getRoutesByFiltersUseCase.execute({
        vesselType: vesselType as string,
        fuelType: fuelType as string,
        year: year ? parseInt(year as string) : undefined,
      });
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  setBaseline = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const route = await this.setBaselineUseCase.execute(id);
      res.json(route);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  };

  getComparison = async (_req: Request, res: Response): Promise<void> => {
    try {
      const comparisons = await this.getRouteComparisonUseCase.execute();
      res.json(comparisons);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
