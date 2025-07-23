const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users.route.js");
const cartRoutes = require('./routes/cart.routes.js');
const bookRoutes = require("./routes/book.routes.js");


dotenv.config({ path: ".env" });

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use(cartRoutes);

app.use("/books", bookRoutes);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`MongoDB connection error: ${err}`));

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
