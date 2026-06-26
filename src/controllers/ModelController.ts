import { Request, Response } from "express";
import { ModelService } from "../services/ModelService";

export class ModelController {
  constructor(private modelService: ModelService) {}

  getMyModels = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const models = await this.modelService.getModelsByOwner(userId);
      res.json(models);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getModelById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const model = await this.modelService.getModelById(id);

      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }

      res.json(model);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  createModel = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { width, height, grid } = req.body;

      const model = await this.modelService.createModel(userId, width, height, grid);
      res.json(model);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  executeModel = async (req: Request, res: Response) => {
  try {
    const modelId = Number(req.params.id);
    const userId = req.user.id;
    const { start, goal } = req.body;

    const result = await this.modelService.executeModel(
      modelId,
      userId,
      start,
      goal
    );

    res.json(result);
  } catch (error: any) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

}
