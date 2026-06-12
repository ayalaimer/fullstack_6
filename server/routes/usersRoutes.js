const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  getAll, getById, getUserTodos, getUserPosts,
  getUserAlbums, updateProfile, updatePassword
} = require('../controllers/usersController');

router.get('/',                getAll);
router.get('/:id',             getById);
router.get('/:id/todos',       getUserTodos);
router.get('/:id/posts',       getUserPosts);
router.get('/:id/albums',      getUserAlbums);
router.put('/:id',             auth, updateProfile);
router.put('/:id/password',    auth, updatePassword);

module.exports = router;
