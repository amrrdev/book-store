const express = require('express')
const router = express.Router()
const { addToCart, removeFromCart, getCart } = require('../controllers/cart.controller.js')
const { auth, restrictTo } = require('../middlewares/auth.middleware.js')

router.post('/cart/add', auth, addToCart)
router.delete('/cart/remove/:bookId', auth, removeFromCart)
router.get('/cart', auth, getCart)
module.exports = router