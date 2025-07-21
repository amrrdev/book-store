const express = require('express')
const router = express.Router()
const { addToCart, removeFromCart, getCart } = require('../controllers/cart.controller.js')
const { authenticate, restrictTo } = require('../middlewares/auth.middleware.js')

router.post('/cart/add', authenticate, addToCart)
router.delete('/cart/remove/:bookId', authenticate, removeFromCart)
router.get('/cart', authenticate, getCart)
module.exports = router