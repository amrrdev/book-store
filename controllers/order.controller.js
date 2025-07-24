const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Book = require("../models/book.models");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate("books.book");
    if (!cart || cart.books.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.books) {
      const book = cartItem.book;

      if (!book) {
        return res.status(400).json({
          message: "One or more books in cart no longer exist",
        });
      }

      if (book.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${book.title}. Available: ${book.stock}, Requested: ${cartItem.quantity}`,
        });
      }

      const orderItem = {
        book: book._id,
        quantity: cartItem.quantity,
      };

      orderItems.push(orderItem);
      totalAmount += book.price * cartItem.quantity;
    }

    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      totalAmount,
    });

    await order.save();

    for (const cartItem of cart.books) {
      await Book.findByIdAndUpdate(cartItem.book._id, { $inc: { stock: -cartItem.quantity } });
    }

    await Cart.findOneAndDelete({ user: userId });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "firstName lastName email")
      .populate("orderItems.book", "title author category price");

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate("orderItems.book", "title author category price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });

    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    let query = { _id: orderId };
    if (userRole !== "admin") {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate("user", "firstName lastName email")
      .populate("orderItems.book", "title author category price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Server error while fetching order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Valid statuses: " + validStatuses.join(", "),
      });
    }

    const updateData = {};
    if (status) updateData.status = status;

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate("user", "firstName lastName email")
      .populate("orderItems.book", "title author category price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error while updating order status" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "firstName lastName email")
      .populate("orderItems.book", "title author category price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    let query = { _id: orderId };
    if (userRole !== "admin") {
      query.user = userId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (userRole !== "admin" && order.status !== "pending") {
      return res.status(400).json({
        message: "Order can only be cancelled when status is pending",
      });
    }

    order.status = "cancelled";
    await order.save();

    for (const item of order.orderItems) {
      await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "firstName lastName email")
      .populate("orderItems.book", "title author category price");

    res.status(200).json({
      message: "Order cancelled successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
};
