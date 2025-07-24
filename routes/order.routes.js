const express = require("express");
const { auth, restrictTo } = require("../middlewares/auth.middleware");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} = require("../controllers/order.controller");

const router = express.Router();

router.use(auth);

router.post("/create", createOrder);
router.get("/my-orders", getUserOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

router.get("/", restrictTo("admin"), getAllOrders);
router.patch("/:orderId/status", restrictTo("admin"), updateOrderStatus);

module.exports = router;
