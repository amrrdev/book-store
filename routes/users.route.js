const express = require("express");
const {
  registerUser,
  login,
  refreshToken,
  getUserById,
  updateUserById,
  getUsers,
  deleteUserById,
} = require("../controllers/users.controller.js");
const { auth, restrictTo } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);

router.use(auth);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/refresh-token", refreshToken);
router.patch("/:id", updateUserById);

router.delete("/:id", restrictTo("admin"), deleteUserById);
module.exports = router;
