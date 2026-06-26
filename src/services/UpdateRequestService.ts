import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CellUpdate } from "../types/CellUpdate";

export class UpdateRequestService {
  constructor(
    private updateRepo: UpdateRequestRepository,
    private modelRepo: GridModelRepository,
    private userRepo: UserRepository
  ) {}

  private applyCells(grid: number[][], cells: CellUpdate[]): number[][] {
    const newGrid = grid.map(row => [...row]);
    for (const c of cells) {
      if (
        c.y >= 0 && c.y < newGrid.length &&
        c.x >= 0 && c.x < newGrid[0].length
      ) {
        newGrid[c.y][c.x] = c.newValue;
      }
    }
    return newGrid;
  }

  async createRequest(modelId: number, requesterId: number, cells: CellUpdate[]) {
    const model = await this.modelRepo.findById(modelId);
    if (!model) throw new Error("Model not found");

    const isOwner = model.ownerId === requesterId;

    if (!isOwner) {
      const cost = 0.25 * cells.length;
      await this.userRepo.decreaseTokens(requesterId, cost);
    }

    if (isOwner) {
      const updatedGrid = this.applyCells(model.grid, cells);
      await this.modelRepo.updateGrid(modelId, updatedGrid);

      return {
        message: "Update applied immediately (owner request)",
        newGrid: updatedGrid
      };
    }

    return this.updateRepo.create({
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

  async bulkUpdate(approverId: number, approveIds: number[], rejectIds: number[]) {
    for (const id of approveIds) {
      await this.approveRequest(id, approverId);
    }
    for (const id of rejectIds) {
      await this.rejectRequest(id, approverId);
    }
    return { message: "Bulk update completed" };
  }

  async getHistory(modelId: number, filters: any) {
    return this.updateRepo.findHistory(modelId, filters);
  }

  async getModelStatus(modelId: number) {
    const pending = await this.updateRepo.findPendingByModel(modelId);
    return { pending: pending.length > 0 };
  }

  async getRequestsByRequester(requesterId: number) {
    return this.updateRepo.findByRequester(requesterId);
  }

  async getRequestsForOwner(ownerId: number) {
    return this.updateRepo.findPendingByOwner(ownerId);
  }
}
