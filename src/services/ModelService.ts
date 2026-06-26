import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AStarFinder } from "astar-typescript";

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

    await this.userRepo.decreaseTokens(ownerId, cost);

    return this.modelRepo.create({
      ownerId,
      width,
      height,
      grid
    });
  }

  async executeModel(
    modelId: number,
    userId: number,
    start: { x: number; y: number },
    goal: { x: number; y: number }
  ) {
    const model = await this.modelRepo.findById(modelId);
    if (!model) throw new Error("Model not found");

    const cellCount = model.width * model.height;
    const costTokens = 0.025 * cellCount;

    await this.userRepo.decreaseTokens(userId, costTokens);

    // API CORRETTA DI astar-typescript
    // La matrice va passata dentro l'oggetto 'grid' sotto la proprietà 'matrix'
    const finder = new AStarFinder({
      grid: {
        matrix: model.grid
      },
      diagonalAllowed: false
    });

    const startTime = Date.now();
    const path = finder.findPath(start, goal);
    const endTime = Date.now();

    return {
      path,
      cost: path.length,
      executionTime: endTime - startTime
    };
  }
}