import { DataTypes, Model } from "sequelize";
import sequelize from "../util/database.js";

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "canceled"),
      allowNull: false,
      defaultValue: "pending", // Default status when order is created
    },
  },

  {
    sequelize,
    modelName: "Order",
    tableName: "Orders",
  }
);

export default Order;
