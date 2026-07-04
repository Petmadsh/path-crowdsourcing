import { UpdateRequestRepository } from "../repositories/UpdateRequestRepository";
import { GridModelRepository } from "../repositories/GridModelRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CellUpdate } from "../types/CellUpdate";
import createError from "http-errors";

export class UpdateRequestService {
  constructor(
    private updateRepo: UpdateRequestRepository,
    private modelRepo: GridModelRepository,
    private userRepo: UserRepository
  ) {}

  private validateCells(grid: number[][], cells: CellUpdate[]): void {
    const height = grid.length;
    const width = grid[0]?.length || 0;

    for (const cell of cells) {
      if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height) {
        throw createError.BadRequest(
          `Cella (${cell.x}, ${cell.y}) fuori dalla griglia ${width}x${height}`
        );
      }
    }
  } 

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
    if (!model) throw createError.NotFound("Modello non trovato");

    this.validateCells(model.grid, cells);

    const cost = 0.25 * cells.length;
    const newBalance = await this.userRepo.decreaseTokens(requesterId, cost);

    const isOwner = model.ownerId === requesterId;

    if (isOwner) {
      // Il proprietario applica la modifica immediatamente
      const updatedGrid = this.applyCells(model.grid, cells);
      await this.modelRepo.updateGrid(modelId, updatedGrid);
      return {
        message: "Update applied immediately (owner request)",
        newGrid: updatedGrid,
        tokensCost: cost,
        newBalance
      };
    } else {
      // L'utente non proprietario crea una richiesta in attesa di approvazione
      const request = await this.updateRepo.create({
      modelId,
      requesterId,
      cells,
      status: "pending"
    });
    
    
    return {
      request,
      tokensCost: cost,
      newBalance
    };
    }
  }

  async approveRequest(requestId: number, approverId: number) {
    const request = await this.updateRepo.findById(requestId);
    if (!request) throw createError.NotFound("Richiesta non trovata");

    //Verifica che la richiesta sia ancora in pending
    if (request.status !== "pending") {
      throw createError.BadRequest(
       `Richiesta già ${request.status === "approved" ? "approvata" : "rifiutata"}`
      );
    }

    const model = await this.modelRepo.findById(request.modelId);
    if (!model) throw createError.NotFound("Modello non trovato");

    if (model.ownerId !== approverId) {
      throw createError.Forbidden("Solo il proprietario del modello può approvare questa richiesta");
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
    if (!request) throw createError.NotFound("Richiesta non trovata");

    if (request.status !== "pending") {
      throw createError.BadRequest(
       `Richiesta già ${request.status === "approved" ? "approvata" : "rifiutata"}`
    );
  }

    const model = await this.modelRepo.findById(request.modelId);
    if (!model) throw createError.NotFound("Modello non trovato");

    if (model.ownerId !== approverId) {
      throw createError.Forbidden("Solo il proprietario del modello può rifiutare questa richiesta");
    }

    await this.updateRepo.updateStatus(requestId, "rejected");

    return { message: "Richiesta rifiutata" };
  }

  async bulkUpdate(approverId: number, approveIds: number[], rejectIds: number[]) {
  const errors: string[] = [];

  for (const id of approveIds) {
    try {
      await this.approveRequest(id, approverId);
    } catch (err: any) {
      errors.push(`Approve ${id}: ${err.message}`);
    }
  }

  for (const id of rejectIds) {
    try {
      await this.rejectRequest(id, approverId);
    } catch (err: any) {
      errors.push(`Reject ${id}: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    throw createError.BadRequest(
      `Alcune operazioni non sono state completate: ${errors.join("; ")}`
    );
  }

  return { message: "Aggiornamento Bulk completato" };
}

  async getHistory(modelId: number, filters: any) {
   const history = await this.updateRepo.findHistory(modelId, filters);
  
   return {
     message: history.length === 0 ? "Nessuna modifica trovata in questo arco di tempo" : undefined,
     updates: history
   };
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
