import { GridModel } from "../models/GridModel";
import { UpdateRequest } from "../models/UpdateRequest";

export class GridModelRepository { // Definizione della classe GridModelRepository per gestire le operazioni sul modello GridModel
  async create(data: any) {
    return GridModel.create(data);
  }

async findById(id: number) { // Metodo per trovare un modello GridModel per ID, includendo il proprietario e le richieste di aggiornamento
  return GridModel.findByPk(id, {
    include: [
      {
        association: "owner",
        attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
      },
      "updateRequests"
    ]
  });
}

  async findByOwner(ownerId: number) { // Metodo per trovare tutti i modelli GridModel appartenenti a un determinato proprietario
    return GridModel.findAll({ where: { ownerId } });
  }

  async updateGrid(modelId: number, newGrid: number[][]) { // Metodo per aggiornare la griglia di un modello GridModel specifico
    return GridModel.update(
      { grid: newGrid },
      { where: { id: modelId } }
    );
  }

  async hasPendingRequests(modelId: number) { // Metodo per verificare se un modello GridModel ha richieste di aggiornamento in sospeso
    const count = await UpdateRequest.count({
      where: { modelId, status: "pending" }
    });
    return count > 0;
  }
}
