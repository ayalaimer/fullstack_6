const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/todosController');

// Public: reading todos requires no authentication
router.get('/',     getAll);
router.get('/:id',  getById);

// Protected: mutations require a valid JWT
router.post('/',      auth, create);
router.put('/:id',    auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
