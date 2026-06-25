import { Request, Response } from "express";
import { ModelService } from "../services/ModelService";

export class ModelController {
  constructor(private modelService: ModelService) {}

  createModel = async (req: Request, res: Response) => {
    try {
      const ownerId = req.user.id; // preso dal middleware JWT
      const { width, height, grid } = req.body;

      const model = await this.modelService.createModel(ownerId, width, height, grid);

      res.json(model);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  executeModel = async (req: Request, res: Response) => {
    try {
      const modelId = Number(req.params.id);
      const { start, goal } = req.body;

      const result = await this.modelService.executeModel(modelId, start, goal);

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
