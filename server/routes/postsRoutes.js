const router = require('express').Router();
const { getAll, getById, getPostComments, create, update, remove } = require('../controllers/postsController');

router.get('/',              getAll);
router.get('/:id',           getById);
router.get('/:id/comments',  getPostComments);
router.post('/',             create);
router.put('/:id',           update);
router.delete('/:id',        remove);

module.exports = router;
