import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const createAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    const existingAdmin = await User.findOne({ where: { role: "admin" } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10); // Securely hash the admin password
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        name: adminName,
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

export default createAdminUser;
