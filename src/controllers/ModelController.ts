import { Request, Response, NextFunction } from "express";
import { ModelService } from "../services/ModelService";
import createError from "http-errors";

export class ModelController {
  constructor(private modelService: ModelService) {}

  getMyModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const models = await this.modelService.getModelsByOwner(userId);
      res.json(models);
    } catch (err) {
      next(err);
    }
  };

  getModelById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const model = await this.modelService.getModelById(id);

      if (!model) {
        throw createError.NotFound("Modello non trovato");
      }

      res.json(model);
    } catch (err) {
      next(err);
    }
  };

  createModel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const { width, height, grid } = req.body;

      // Solo logica di business - nessuna validazione
      const model = await this.modelService.createModel(userId, width, height, grid);
      res.json(model);
    } catch (err) {
      next(err);
    }
  };

  executeModel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const modelId = Number(req.params.id);
      const userId = req.user.id;
      const { start, goal } = req.body;

      // Solo logica di business - nessuna validazione
      const result = await this.modelService.executeModel(
        modelId,
        userId,
        start,
        goal
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}