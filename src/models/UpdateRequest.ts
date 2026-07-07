import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { GridModel } from "./GridModel";

interface CellUpdate { // Definizione dell'interfaccia per rappresentare un aggiornamento di cella
  x: number;
  y: number;
  newValue: 0 | 1;
}

interface UpdateRequestAttributes { // Definizione degli attributi del modello UpdateRequest
  id: number;
  modelId: number;
  requesterId: number;
  cells: CellUpdate[];
  status: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpdateRequestCreationAttributes // Definizione degli attributi necessari per creare un'istanza di UpdateRequest
  extends Optional<UpdateRequestAttributes, "id" | "status"> {}

export class UpdateRequest  // Definizione della classe UpdateRequest che estende Model di Sequelize
  extends Model<UpdateRequestAttributes, UpdateRequestCreationAttributes>
  implements UpdateRequestAttributes
{ // Implementazione degli attributi del modello UpdateRequest
  public id!: number;
  public modelId!: number;
  public requesterId!: number;
  public cells!: CellUpdate[];
  public status!: "pending" | "approved" | "rejected";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UpdateRequest.init( // Inizializzazione del modello UpdateRequest con i suoi attributi e opzioni
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

UpdateRequest.belongsTo(GridModel, { foreignKey: "modelId", as: "model" }); // Definizione della relazione tra UpdateRequest e GridModel: una richiesta appartiene a un modello
GridModel.hasMany(UpdateRequest, { foreignKey: "modelId", as: "updateRequests" }); // Definizione della relazione tra GridModel e UpdateRequest: un modello può avere molte richieste di aggiornamento

UpdateRequest.belongsTo(User, { foreignKey: "requesterId", as: "requester" }); // Definizione della relazione tra UpdateRequest e User: una richiesta appartiene a un utente richiedente
User.hasMany(UpdateRequest, { foreignKey: "requesterId", as: "requests" }); // Definizione della relazione tra User e UpdateRequest: un utente può avere molte richieste di aggiornamento
