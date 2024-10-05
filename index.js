// index.js
import dotenv from "dotenv";
import { app } from "./app.js"; // Import the app instance
import sequelize from "./util/database.js"; // Import the Sequelize instance
import createAdminUser from "./util/createAdmin.js";

// Load environment variables
dotenv.config({
  path: "./.env",
});

// Connect to the database and start the server
sequelize
  .sync()
  .then(async () => {
    await createAdminUser();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
