const express = require('express');
const router = express.Router();
const {
    addBook,
    getAllBooks,
    getBookById,
    deleteBook,
    searchBooks
} = require('../controllers/book.controller'); 

const { auth, restrictTo } = require('../middlewares/auth.middleware');


router.post('/', auth, restrictTo('admin'), addBook);
router.get('/', getAllBooks);
router.get('/search', searchBooks);  
router.get('/:id', getBookById);
router.delete('/:id', auth, restrictTo('admin'), deleteBook);
module.exports = router;
