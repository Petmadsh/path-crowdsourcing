import { GridModel } from "../models/GridModel";
import { UpdateRequest } from "../models/UpdateRequest";

export class GridModelRepository {
  async create(data: any) {
    return GridModel.create(data);
  }

async findById(id: number) {
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

  async findByOwner(ownerId: number) {
    return GridModel.findAll({ where: { ownerId } });
  }

  async updateGrid(modelId: number, newGrid: number[][]) {
    return GridModel.update(
      { grid: newGrid },
      { where: { id: modelId } }
    );
  }

  async hasPendingRequests(modelId: number) {
    const count = await UpdateRequest.count({
      where: { modelId, status: "pending" }
    });
    return count > 0;
  }
}
