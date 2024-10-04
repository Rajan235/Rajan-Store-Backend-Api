import { DataTypes, Model } from "sequelize";
import sequelize from "../util/database.js";

class CartItem extends Model {
  // static associate(models) {
  //   this.belongsTo(models.Cart, { foreignKey: "cartId", onDelete: "CASCADE" });
  //   this.belongsTo(models.Product, {
  //     foreignKey: "productId",
  //     onDelete: "CASCADE",
  //   });
  // }
}

CartItem.init(
  {
    id: {
      // type: DataTypes.UUID,
      // primaryKey: true,
      // defaultValue: DataTypes.UUIDV4,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "CartItems",
  }
);
export default CartItem;
