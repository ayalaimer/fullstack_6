const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getAll, getById, getPostComments, create, update, remove } = require('../controllers/postsController');

// Public: reading posts requires no authentication
router.get('/',             getAll);
router.get('/:id',          getById);
router.get('/:id/comments', getPostComments);

// Protected: mutations require a valid JWT
router.post('/',      auth, create);
router.put('/:id',    auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
