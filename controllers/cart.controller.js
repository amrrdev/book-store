const Cart = require("../models/cart.model");

exports.addToCart = async (req, res) => {
  const { bookId, quantity } = req.body;
  const userId = req.userId;

  if (!quantity || quantity <= 0)
    return res.status(400).json({ message: "Quantity must be greater than 0" });

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, books: [] });

  const index = cart.books.findIndex((b) => b.book.toString() === bookId);
  if (index > -1) {
    cart.books[index].quantity += quantity;
  } else {
    cart.books.push({ book: bookId, quantity });
  }

  await cart.save();
  res.status(200).json(cart);
};

exports.removeFromCart = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.userId;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.books = cart.books.filter((b) => b.book.toString() !== bookId);
  await cart.save();
  res.status(200).json(cart);
};

exports.getCart = async (req, res) => {
  const userId = req.userId;
  const cart = await Cart.findOne({ user: userId }).populate("books.book");
  if (!cart) return res.status(404).json({ message: "Cart is empty" });

  // Calculate total cart value
  const totalValue = cart.books.reduce((sum, item) => {
    return sum + item.book.price * item.quantity;
  }, 0);

  res.status(200).json({
    ...cart.toObject(),
    totalValue,
  });
};

exports.clearCart = async (req, res) => {
  const userId = req.userId;

  await Cart.findOneAndDelete({ user: userId });
  res.status(200).json({ message: "Cart cleared successfully" });
};

exports.updateCartItem = async (req, res) => {
  const { bookId } = req.params;
  const { quantity } = req.body;
  const userId = req.userId;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const index = cart.books.findIndex((b) => b.book.toString() === bookId);
  if (index === -1) {
    return res.status(404).json({ message: "Book not found in cart" });
  }

  cart.books[index].quantity = quantity;
  await cart.save();

  const updatedCart = await Cart.findOne({ user: userId }).populate("books.book");
  const totalValue = updatedCart.books.reduce((sum, item) => {
    return sum + item.book.price * item.quantity;
  }, 0);

  res.status(200).json({
    ...updatedCart.toObject(),
    totalValue,
  });
};
