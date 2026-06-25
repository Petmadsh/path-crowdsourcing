import { UpdateRequest } from "../models/UpdateRequest";

export async function seedUpdates(models: any, users: any) {
  const { model1, model2 } = models;
  const { user2, user1 } = users;

  // Richiesta pending
  await UpdateRequest.create({
    modelId: model1.id,
    requesterId: user2.id,
    cells: [
      { x: 0, y: 0, newValue: 1 },
      { x: 1, y: 1, newValue: 0 }
    ],
    status: "pending"
  });

  // Richiesta accettata
  await UpdateRequest.create({
    modelId: model2.id,
    requesterId: user1.id,
    cells: [
      { x: 2, y: 2, newValue: 1 }
    ],
    status: "approved"
  });

  // Richiesta rifiutata
  await UpdateRequest.create({
    modelId: model1.id,
    requesterId: user2.id,
    cells: [
      { x: 4, y: 4, newValue: 0 }
    ],
    status: "rejected"
  });
}
