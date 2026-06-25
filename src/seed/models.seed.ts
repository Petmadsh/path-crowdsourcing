import { GridModel } from "../models/GridModel";

export async function seedModels(users: any) {
  const { user1, user2 } = users;

  const model1 = await GridModel.create({
    ownerId: user1.id,
    width: 5,
    height: 5,
    grid: [
      [0,0,0,1,0],
      [0,1,0,1,0],
      [0,1,0,0,0],
      [0,0,0,1,0],
      [1,1,0,0,0]
    ]
  });

  const model2 = await GridModel.create({
    ownerId: user2.id,
    width: 4,
    height: 4,
    grid: [
      [0,0,1,0],
      [0,1,1,0],
      [0,0,0,0],
      [1,0,0,0]
    ]
  });

  const model3 = await GridModel.create({
    ownerId: user1.id,
    width: 3,
    height: 3,
    grid: [
      [0,1,0],
      [0,0,0],
      [1,0,1]
    ]
  });

  return { model1, model2, model3 };
}
