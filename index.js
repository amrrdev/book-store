const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users.route.js");

dotenv.config({ path: ".env" });

const app = express();

app.use(express.json());

app.use("/users", userRoutes);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log(`MongoDB connection error: ${err}`));

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
