import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

interface GridModelAttributes { // Definizione degli attributi del modello GridModel
  id: number;
  ownerId: number;
  width: number;
  height: number;
  grid: number[][];
  createdAt?: Date;
  updatedAt?: Date;
}

interface GridModelCreationAttributes extends Optional<GridModelAttributes, "id"> {}

export class GridModel extends Model<GridModelAttributes, GridModelCreationAttributes> implements GridModelAttributes { // Definizione della classe GridModel che estende Model di Sequelize
  public id!: number;
  public ownerId!: number;
  public width!: number;
  public height!: number;
  public grid!: number[][];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GridModel.init( // Inizializzazione del modello GridModel con i suoi attributi e opzioni
  { 
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    width: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    height: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    grid: {
      type: DataTypes.JSON,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "grid_models"
  }
);

GridModel.belongsTo(User, { foreignKey: "ownerId", as: "owner" }); // Definizione della relazione tra GridModel e User: un modello appartiene a un utente
User.hasMany(GridModel, { foreignKey: "ownerId", as: "models" }); // Definizione della relazione tra User e GridModel: un utente può avere molti modelli
