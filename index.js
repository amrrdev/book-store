const express = require("express");

const app = express();

app.use(express.json());

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
