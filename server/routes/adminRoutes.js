const router  = require('express').Router();
const auth    = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { listUsers, blockUser, unblockUser } = require('../controllers/adminController');

router.get('/users',               auth, isAdmin, listUsers);
router.put('/users/:id/block',     auth, isAdmin, blockUser);
router.put('/users/:id/unblock',   auth, isAdmin, unblockUser);

module.exports = router;
