import { UpdateRequest } from "../models/UpdateRequest";

export class UpdateRequestRepository {
  async create(data: any) {
    return UpdateRequest.create(data);
  }

  async findById(id: number) {
    return UpdateRequest.findByPk(id, {
      include: ["model", "requester"]
    });
  }

  async findPendingByModel(modelId: number) {
    return UpdateRequest.findAll({
      where: { modelId, status: "pending" }
    });
  }

  async findPendingByOwner(ownerId: number) {
    return UpdateRequest.findAll({
      include: [
        {
          association: "model",
          where: { ownerId }
        }
      ],
      where: { status: "pending" }
    });
  }

  async updateStatus(id: number, status: "pending" | "approved" | "rejected") {
    return UpdateRequest.update(
      { status },
      { where: { id } }
    );
  }
}
