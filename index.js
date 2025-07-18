const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log(`MongoDB connection error: ${err}`));

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
