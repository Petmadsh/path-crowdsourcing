import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AStarFinder, Grid } from "astar-typescript";

export class ModelService {
  constructor(
    private modelRepo: GridModelRepository,
    private userRepo: UserRepository
  ) {}

  async createModel(ownerId: number, width: number, height: number, grid: number[][]) {
    const cost = 0.025 * (width * height);

    await this.userRepo.decreaseTokens(ownerId, cost);

    return this.modelRepo.create({
      ownerId,
      width,
      height,
      grid
    });
  }

  async executeModel(modelId: number, start: any, goal: any) {
    const model = await this.modelRepo.findById(modelId);
    if (!model) throw new Error("Model not found");

    // 1) Creazione griglia
    const grid = new Grid({
      matrix: model.grid
    });

    // 2) Creazione finder (ACCETTA SOLO 1 ARGOMENTO)
    const finder = new AStarFinder({
      grid,
      diagonalAllowed: false,
      heuristic: "Manhattan"
    });

    // 3) Esecuzione pathfinding (ACCETTA SOLO 2 ARGOMENTI)
    const t0 = performance.now();
    const path = finder.findPath(
      { x: start.x, y: start.y },
      { x: goal.x, y: goal.y }
    );
    const t1 = performance.now();

    return {
      path,
      cost: path.length,
      executionTime: t1 - t0
    };
  }
}
