import User from "../models/user.model";
import bcrypt from "bcrypt";

const createAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const existingAdmin = await User.findOne({ where: { isAdmin: true } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10); // Securely hash the admin password
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
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
