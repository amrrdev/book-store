const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: String,
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: String,
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);