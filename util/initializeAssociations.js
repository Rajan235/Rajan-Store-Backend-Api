const initializeAssociations = (sequelize) => {
  const { User, Product, Order, OrderItem, Cart, CartItem } = sequelize.models;

  // User and Product (admin creating products)
  User.hasMany(Product, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
  });

  // User and Order
  User.hasMany(Order, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
  Order.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
  });

  // Order and Product through OrderItem
  Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: { name: "orderId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });

  // Proper associations for OrderItem
  OrderItem.belongsTo(Order, {
    foreignKey: { name: "orderId", allowNull: false },
    onDelete: "CASCADE",
  });
  Order.hasMany(OrderItem, {
    foreignKey: { name: "orderId", allowNull: false },
    onDelete: "CASCADE",
  });

  OrderItem.belongsTo(Product, {
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.hasMany(OrderItem, {
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });

  // CartItem and its associations
  CartItem.belongsTo(Cart, {
    foreignKey: { name: "cartId", allowNull: false },
    onDelete: "CASCADE",
  });
  CartItem.belongsTo(Product, {
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });
  Cart.hasMany(CartItem, {
    foreignKey: { name: "cartId", allowNull: false },
    onDelete: "CASCADE",
  });
  Product.hasMany(CartItem, {
    foreignKey: { name: "productId", allowNull: false },
    onDelete: "CASCADE",
  });

  // Cart and User
  Cart.belongsTo(User, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
  User.hasOne(Cart, {
    foreignKey: { name: "userId", allowNull: false },
    onDelete: "CASCADE",
  });
};

export default initializeAssociations;
