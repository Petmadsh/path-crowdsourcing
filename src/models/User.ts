import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes { // Definizione degli attributi del modello User
  id: number;
  email: string;
  passwordHash?: string;
  role: "user" | "admin";
  tokens: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "role" | "tokens"> {} // Definizione degli attributi necessari per creare un'istanza di User

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes { // Definizione della classe User che estende Model di Sequelize
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public role!: "user" | "admin";
  public tokens!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // nascondere passwordHash nelle risposte JSON
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  }
}

User.init( // Inizializzazione del modello User con i suoi attributi e opzioni
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user"
    },
    tokens: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "users"
  }
);