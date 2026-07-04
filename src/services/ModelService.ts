import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AStarFinder } from "astar-typescript";
import createError from "http-errors";

export class ModelService {
  constructor(
    private modelRepo: GridModelRepository,
    private userRepo: UserRepository
  ) {}

  async getModelsByOwner(ownerId: number) {
    return this.modelRepo.findByOwner(ownerId);
  }

  async getModelById(id: number) {
    return this.modelRepo.findById(id);
  }

  async createModel(ownerId: number, width: number, height: number, grid: number[][]) {
    const cellCount = width * height;
    const cost = 0.025 * cellCount;
    const newBalance = await this.userRepo.decreaseTokens(ownerId, cost);
    const model = await this.modelRepo.create({
      ownerId,
      width,
      height,
      grid
    });

   return {
     model,
     tokensCost: cost,
     newBalance
  };
  }

  async executeModel(
    modelId: number,
    userId: number,
    start: { x: number; y: number },
    goal: { x: number; y: number }
  ) {
    const model = await this.modelRepo.findById(modelId);
    if (!model) {
      throw createError.NotFound("Modello non trovato");
    }

    // Validazione: coordinate devono essere all'interno della griglia
    if (start.x < 0 || start.x >= model.width || start.y < 0 || start.y >= model.height) {
      throw createError.BadRequest(
        `Start (${start.x}, ${start.y}) fuori dalla griglia ${model.width}x${model.height}`
      );
    }
    if (goal.x < 0 || goal.x >= model.width || goal.y < 0 || goal.y >= model.height) {
      throw createError.BadRequest(
        `Goal (${goal.x}, ${goal.y}) fuori dalla griglia ${model.width}x${model.height}`
      );
    }

    // start e goal non devono essere ostacoli (valore 1)
  if (model.grid[start.y][start.x] === 1 || model.grid[goal.y][goal.x] === 1) {
    throw createError.BadRequest("Start o goal sono ostacoli (valore 1)");
  }

    const cellCount = model.width * model.height;
    const costTokens = 0.025 * cellCount;
    const newBalance = await this.userRepo.decreaseTokens(userId, costTokens);

    const finder = new AStarFinder({
      grid: { matrix: model.grid },
      diagonalAllowed: false,
    });

    const startTime = performance.now();
    const path = finder.findPath(start, goal);
    const endTime = performance.now();

    return {
      path,
      cost: path.length,
      executionTimeMs: Number((endTime - startTime).toFixed(4)),
      tokensCost: costTokens,
      newBalance
    };
  }
}