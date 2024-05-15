const router = require('express').Router(); // On utilise le router d'express
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const { checkAdmin, checkAdminOrOwner } = require('../middleware/admin.middleware');
const multer = require('multer');

router.post("/register", authController.signUp);
router.post("/login", authController.signIn); // JWT generation and pass to cookies
router.get("/logout", authController.logout); // remove JWT from cookies


router.get('/', checkAdmin, userController.getUsers);
router.get('/:id', checkAdminOrOwner, userController.getUser);
router.put('/:id', userController.updateUser);
router.put('/block/:id', checkAdmin, userController.updateBlocked);
router.put('/verify/:id', userController.verifyUser);
router.delete('/:id', checkAdmin, userController.deleteUser);
router.patch('/follow/:id', userController.followLot);
router.patch('/unfollow/:id', userController.unfollowLot);
router.get('/followedLots/:id', checkAdminOrOwner, userController.followedLots);
router.get('/followedLotsInfos/:id', checkAdminOrOwner, userController.followedLotsInfos);
router.get('/bids/:id', checkAdminOrOwner, userController.bids);
router.get('/sales/:id', checkAdminOrOwner, userController.getSales);


const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/billings/' + req.body.auctionId);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + req.body.userId+ '-' + file.originalname);
        }
    })
});

router.post('/sendBill', upload.single('bill'), userController.receiveBill);
router.post('/modifyBill', upload.single('bill'), userController.modifyBill);


module.exports = router;