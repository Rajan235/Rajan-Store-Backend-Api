import { DataTypes, Model } from "sequelize";
import sequelize from "../util/database.js";

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "Carts",
  }
);

export default Cart;
