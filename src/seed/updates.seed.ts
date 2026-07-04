import { UpdateRequest } from "../models/UpdateRequest";


export async function seedUpdates(models: any, users: any) {
  const { model1, model2, model3 } = models;
  const { user1, user2 } = users; 

  // proprietario: user1
  // 1. Richiesta in pending (da user2)
  await UpdateRequest.create({
    modelId: model1.id,
    requesterId: user2.id,
    cells: [
      { x: 0, y: 0, newValue: 1 }, 
      { x: 1, y: 1, newValue: 0 }  
    ],
    status: "pending"
  });

  // 2. Richiesta rifiutata (da user2)
  await UpdateRequest.create({
    modelId: model1.id,
    requesterId: user2.id,
    cells: [
      { x: 4, y: 4, newValue: 0 }  
    ],
    status: "rejected"
  });

  // 3. Richiesta APPROVATA per model1 (da user2, non proprietario)

  await UpdateRequest.create({
    modelId: model1.id,
    requesterId: user2.id,
    cells: [
      { x: 2, y: 2, newValue: 1 }
    ],
    status: "approved"
  });

  // (proprietario: user2)
  // 4. Richiesta approvata (da user1, non proprietario)

  await UpdateRequest.create({
    modelId: model2.id,
    requesterId: user1.id,
    cells: [
      { x: 2, y: 2, newValue: 1 }
    ],
    status: "approved"
  });

  // (proprietario: user1)
  // 5. Richiesta approvata per model3 (da user2)
  await UpdateRequest.create({
    modelId: model3.id,
    requesterId: user2.id,
    cells: [
      { x: 1, y: 1, newValue: 1 }
    ],
    status: "approved"
  });


  await UpdateRequest.create({
    modelId: model3.id,
    requesterId: user2.id,
    cells: [
      { x: 0, y: 0, newValue: 1 } 
    ],
    status: "pending"
  });
}