const Cart = require('../models/cart.model')

exports.addToCart = async (req, res) => {
    const { bookId, quantity } = req.body
    const userId = req.user.id

    if (!quantity || quantity <= 0)
        return res.status(400).json({ message: 'Quantity must be greater than 0' })

    let cart = await Cart.findOne({ user: userId })
    if (!cart) cart = new Cart({ user: userId, books: [] })

    const index = cart.books.findIndex(b => b.book.toString() === bookId)
    if (index > -1) {
        cart.books[index].quantity += quantity
    } else {
        cart.books.push({ book: bookId, quantity })
    }

    await cart.save()
    res.status(200).json(cart)
}

exports.removeFromCart = async (req, res) => {
    const { bookId } = req.params
    const userId = req.user.id

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    cart.books = cart.books.filter(b => b.book.toString() !== bookId)
    await cart.save()
    res.status(200).json(cart)
}

exports.getCart = async (req, res) => {
    const userId = req.user.id
    const cart = await Cart.findOne({ user: userId }).populate('books.book')
    if (!cart) return res.status(404).json({ message: 'Cart is empty' })
    res.status(200).json(cart)
}

