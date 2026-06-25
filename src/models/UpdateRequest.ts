import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { GridModel } from "./GridModel";

interface CellUpdate {
  x: number;
  y: number;
  newValue: 0 | 1;
}

interface UpdateRequestAttributes {
  id: number;
  modelId: number;
  requesterId: number;
  cells: CellUpdate[];
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpdateRequestCreationAttributes
  extends Optional<UpdateRequestAttributes, "id" | "status"> {}

export class UpdateRequest
  extends Model<UpdateRequestAttributes, UpdateRequestCreationAttributes>
  implements UpdateRequestAttributes
{
  public id!: number;
  public modelId!: number;
  public requesterId!: number;
  public cells!: CellUpdate[];
  public status!: "pending" | "approved" | "rejected";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UpdateRequest.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    modelId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    requesterId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    cells: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending"
    }
  },
  {
    sequelize,
    tableName: "update_requests"
  }
);

UpdateRequest.belongsTo(GridModel, { foreignKey: "modelId", as: "model" });
GridModel.hasMany(UpdateRequest, { foreignKey: "modelId", as: "updateRequests" });

UpdateRequest.belongsTo(User, { foreignKey: "requesterId", as: "requester" });
User.hasMany(UpdateRequest, { foreignKey: "requesterId", as: "requests" });
