const router = require('express').Router();
const auth   = require('../middleware/auth');
const {
  getAll, getById, getAlbumPhotos, create, update, remove
} = require('../controllers/albumsController');

router.get('/',              auth, getAll);
router.get('/:id',           auth, getById);
router.get('/:id/photos',    auth, getAlbumPhotos);
router.post('/',             auth, create);
router.put('/:id',           auth, update);
router.delete('/:id',        auth, remove);

module.exports = router;
