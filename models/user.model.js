import { DataTypes, Model } from "sequelize";
import sequelize from "../util/database.js";

import Product from "./product.model.js";
import Cart from "./cart.model.js";
import CartItem from "./cart-item.model.js";

class User extends Model {
  async getCart() {
    const user = await User.findByPk(this.id, {
      include: [
        {
          model: Cart,
          include: [
            {
              model: CartItem,
              include: [Product],
            },
          ],
        },
      ],
    });

    return user ? user.Cart : null;
  }
  async removeFromCart(productId) {
    const cart = await this.getCart();
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId: productId },
    });

    if (!cartItem) {
      const error = new Error("Cart item not found");
      error.statusCode = 404;
      throw error;
    }

    await cartItem.destroy();
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // username: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    // },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  }
);
export default User;
