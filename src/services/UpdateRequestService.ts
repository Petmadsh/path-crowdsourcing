import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { CellUpdate } from "../types/CellUpdate";

export class UpdateRequestService {
  constructor(
    private updateRepo: UpdateRequestRepository,
    private modelRepo: GridModelRepository
  ) {}

  private applyCells(grid: number[][], cells: CellUpdate[]): number[][] {
    const newGrid = grid.map(row => [...row]);

    for (const cell of cells) {
      if (
        cell.y >= 0 && cell.y < newGrid.length &&
        cell.x >= 0 && cell.x < newGrid[0].length
      ) {
        newGrid[cell.y][cell.x] = cell.newValue;
      }
    }

    return newGrid;
  }

  async createRequest(modelId: number, requesterId: number, cells: CellUpdate[]) {
    const model = await this.modelRepo.findById(modelId);
    if (!model) throw new Error("Model not found");

    const isOwner = model.ownerId === requesterId;

    if (isOwner) {
      const updatedGrid = this.applyCells(model.grid, cells);
      await this.modelRepo.updateGrid(modelId, updatedGrid);

      return {
        message: "Update applied immediately (owner request)",
        newGrid: updatedGrid
      };
    }

    return await this.updateRepo.create({
      modelId,
      requesterId,
      cells,
      status: "pending"
    });
  }

  async approveRequest(requestId: number, approverId: number) {
    const request = await this.updateRepo.findById(requestId);
    if (!request) throw new Error("Request not found");

    const model = await this.modelRepo.findById(request.modelId);
    if (!model) throw new Error("Model not found");

    if (model.ownerId !== approverId) {
      throw new Error("Only the model owner can approve this request");
    }

    const updatedGrid = this.applyCells(model.grid, request.cells);
    await this.modelRepo.updateGrid(model.id, updatedGrid);

    await this.updateRepo.updateStatus(requestId, "approved");

    return {
      message: "Update applied",
      newGrid: updatedGrid
    };
  }

  async rejectRequest(requestId: number, approverId: number) {
    const request = await this.updateRepo.findById(requestId);
    if (!request) throw new Error("Request not found");

    const model = await this.modelRepo.findById(request.modelId);
    if (!model) throw new Error("Model not found");

    if (model.ownerId !== approverId) {
      throw new Error("Only the model owner can reject this request");
    }

    await this.updateRepo.updateStatus(requestId, "rejected");

    return { message: "Update rejected" };
  }
}
