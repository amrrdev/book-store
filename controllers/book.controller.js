const Book = require("../models/book.models");

exports.addBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: "Book added successfully", data: book });
  } catch (error) {
    res.status(400).json({ message: "Failed to add book", error: error.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    let books = await Book.find();
    res.status(200).json({ message: "successful", data: books });
  } catch (error) {
    res.status(400).json({ message: "fail to retrive books" });
  }
};

exports.getBookById = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book found successfully", data: book });
  } catch (error) {
    res.status(400).json({ message: "fail to retrival Books" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    let book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "fail to delete book" });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { title, author, category } = req.query;
    let filtered = {};

    if (title) filtered.title = new RegExp(title, "i");
    if (author) filtered.author = new RegExp(author, "i");
    if (category) filtered.category = new RegExp(category, "i");

    const books = await Book.find(filtered);
    res.status(200).json({ message: "Books retrieved successfully", data: books });
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve books", error: error.message });
  }
};
