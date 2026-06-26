import { UpdateRequest } from "../models/UpdateRequest";
import { Op } from "sequelize";

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

  async findByRequester(requesterId: number) {
    return UpdateRequest.findAll({
      where: { requesterId },
      include: ["model"]
    });
  }

  async updateStatus(id: number, status: "pending" | "approved" | "rejected") {
    return UpdateRequest.update(
      { status },
      { where: { id } }
    );
  }

  async findHistory(
    modelId: number,
    filters: { from?: string; to?: string; status?: string }
  ) {
    const where: any = { modelId };

    if (filters.from) {
      where.createdAt = { ...(where.createdAt || {}), [Op.gte]: filters.from };
    }
    if (filters.to) {
      where.createdAt = { ...(where.createdAt || {}), [Op.lte]: filters.to };
    }
    if (filters.status) {
      where.status = filters.status;
    }

    return UpdateRequest.findAll({ where });
  }
}
