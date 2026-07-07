import { UpdateRequest } from "../models/UpdateRequest";
import { Op } from "sequelize";

export class UpdateRequestRepository { // Definizione della classe UpdateRequestRepository per gestire le operazioni sul modello UpdateRequest
  async create(data: any) {
    return UpdateRequest.create(data);
  }

  async findById(id: number) { // Metodo per trovare una richiesta di aggiornamento UpdateRequest per ID, includendo il modello e il richiedente
    return UpdateRequest.findByPk(id, {
      include: [
        {
          association: "model",
          include: [
            {
              association: "owner",
              attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
            }
          ]
        },
        {
          association: "requester",
          attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
        }
      ]
    });
  }

  async findPendingByModel(modelId: number) { // Metodo per trovare tutte le richieste di aggiornamento UpdateRequest in sospeso per un determinato modello GridModel, includendo il modello e il richiedente
    return UpdateRequest.findAll({
      where: { modelId, status: "pending" },
      include: [
        {
          association: "model",
          include: [
            {
              association: "owner",
              attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
            }
          ]
        },
        {
          association: "requester",
          attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
        }
      ]
    });
  }

  async findPendingByOwner(ownerId: number) { // Metodo per trovare tutte le richieste di aggiornamento UpdateRequest in sospeso per tutti i modelli GridModel appartenenti a un determinato proprietario, includendo il modello e il richiedente
    return UpdateRequest.findAll({
      include: [
        {
          association: "model",
          where: { ownerId },
          include: [
            {
              association: "owner",
              attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
            }
          ]
        },
        {
          association: "requester",
          attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
        }
      ],
      where: { status: "pending" }
    });
  }

  async findByRequester(requesterId: number) { // Metodo per trovare tutte le richieste di aggiornamento UpdateRequest inviate da un determinato richiedente, includendo il modello e il richiedente
    return UpdateRequest.findAll({
      where: { requesterId },
      include: [
        {
          association: "model",
          include: [
            {
              association: "owner",
              attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
            }
          ]
        },
        {
          association: "requester",
          attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
        }
      ]
    });
  }

  async updateStatus(id: number, status: "pending" | "approved" | "rejected") { // Metodo per aggiornare lo stato di una richiesta di aggiornamento UpdateRequest specifica
    return UpdateRequest.update(
      { status },
      { where: { id } }
    );
  }

  async findHistory( // Metodo per trovare la cronologia delle richieste di aggiornamento UpdateRequest per un determinato modello GridModel, con filtri opzionali per data e stato, includendo il modello e il richiedente
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

    return UpdateRequest.findAll({ // Esegue la query per trovare tutte le richieste di aggiornamento UpdateRequest che soddisfano i criteri specificati, includendo il modello e il richiedente
      where,
      include: [
        {
          association: "model",
          include: [
            {
              association: "owner",
              attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
            }
          ]
        },
        {
          association: "requester",
          attributes: { exclude: ["passwordHash", "createdAt", "updatedAt", "tokens"] }
        }
      ]
    });
  }
}