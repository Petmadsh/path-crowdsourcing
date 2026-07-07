import { UpdateRequest } from "../models/UpdateRequest";
import { GridModel } from "../models/GridModel";

// Funzione per applicare le modifiche alle celle della griglia di un modello GridModel
function applyCells(
  grid: number[][],
  cells: { x: number; y: number; newValue: number }[]
): number[][] {
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

// Funzione per creare una richiesta di aggiornamento UpdateRequest e, se approvata, aggiornare la griglia del modello GridModel
async function seedUpdateRequest(params: {
  model: GridModel;
  requesterId: number;
  cells: { x: number; y: number; newValue: 0 | 1 }[];
  status: "pending" | "approved" | "rejected";
}) {
  const { model, requesterId, cells, status } = params;

  const request = await UpdateRequest.create({
    modelId: model.id,
    requesterId,
    cells,
    status
  });

  if (status === "approved") {
    // Ricarica la griglia più aggiornata (nel caso ci siano più approvazioni in sequenza sullo stesso modello)
    const fresh = await GridModel.findByPk(model.id);
    if (fresh) {
      const updatedGrid = applyCells(fresh.grid, cells);
      await GridModel.update(
        { grid: updatedGrid },
        { where: { id: model.id } }
      );
    }
  }

  return request;
}

export async function seedUpdates(models: any, users: any) {
  const { model1, model2, model3 } = models;
  const { user1, user2 } = users;

  // proprietario: user1
  // 1. Richiesta in pending (da user2)
  await seedUpdateRequest({
    model: model1,
    requesterId: user2.id,
    cells: [
      { x: 0, y: 0, newValue: 1 },
      { x: 1, y: 1, newValue: 0 }
    ],
    status: "pending"
  });

  // 2. Richiesta rifiutata (da user2)
  await seedUpdateRequest({
    model: model1,
    requesterId: user2.id,
    cells: [
      { x: 4, y: 4, newValue: 0 }
    ],
    status: "rejected"
  });

  // 3. Richiesta APPROVATA per model1 (da user2, non proprietario)
  // -> la griglia di model1 viene EFFETTIVAMENTE aggiornata: questa è la "versione 2" di model1
  await seedUpdateRequest({
    model: model1,
    requesterId: user2.id,
    cells: [
      { x: 2, y: 2, newValue: 1 }
    ],
    status: "approved"
  });

  // (proprietario: user2)
  // 4. Richiesta approvata (da user1, non proprietario)
  // -> "versione 2" di model2
  await seedUpdateRequest({
    model: model2,
    requesterId: user1.id,
    cells: [
      { x: 2, y: 2, newValue: 1 }
    ],
    status: "approved"
  });

  // (proprietario: user1)
  // 5. Richiesta approvata per model3 (da user2)
  // -> "versione 2" di model3
  await seedUpdateRequest({
    model: model3,
    requesterId: user2.id,
    cells: [
      { x: 1, y: 1, newValue: 1 }
    ],
    status: "approved"
  });

  // 6. Ulteriore richiesta pending su model3 (resta in attesa, non tocca la griglia)
  await seedUpdateRequest({
    model: model3,
    requesterId: user2.id,
    cells: [
      { x: 0, y: 0, newValue: 1 }
    ],
    status: "pending"
  });
}