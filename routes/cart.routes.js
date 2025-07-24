const {
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
  updateCartItem,
} = require("../controllers/cart.controller.js");
const { auth, restrictTo } = require("../middlewares/auth.middleware.js");

const express = require("express");
const router = express.Router();
router.use(auth);

router.post("/cart/add", addToCart);
router.delete("/cart/remove/:bookId", removeFromCart);
router.get("/cart", getCart);
router.delete("/cart/clear", clearCart);
router.put("/cart/update/:bookId", updateCartItem);
module.exports = router;
