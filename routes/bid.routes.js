const router = require('express').Router();
const bidController = require('../controllers/bid.controller');
const {
    checkAdmin,
    checkAdminOrOwner
} = require('../middleware/admin.middleware');

router.post('/', bidController.createBid);
/* router.get('/', checkAdmin, bidController.getBids); */
router.get('/', bidController.getBids);
router.get('/:id', checkAdminOrOwner, bidController.getBid);
router.delete('/:id', checkAdmin, bidController.deleteBid);

module.exports = router;