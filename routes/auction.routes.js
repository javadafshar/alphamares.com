const router = require('express').Router(); // On utilise le router d'express
const auctionController = require('../controllers/auction.controller');
const { checkAdmin } = require('../middleware/admin.middleware');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/auctionPictures')
    },
    
    filename: function (req, file, cb) {
        if (file.fieldname === 'picture') {
            cb(null, `./Auction_${Date.now()}_picture.jpg`);
        } else {
            cb(new Error('Champ du formulaire invalide'));
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 8388608 } // 8 Mo in octets
}).single('picture')

const uploadPicture = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err);
            return res.status(400).json(err.code);
        } else if (err) {
            console.log(err);
            return res.status(400).json(err.message);
        }
        next();
    })
}

router.post("/register", uploadPicture, auctionController.createAuction); 
router.get('/currentAuctionLots', auctionController.currentAuctionWithLots);
router.get('/auctionsWithSales', auctionController.getAllAuctionsWithSales);
router.get('/',  auctionController.getAuctions); 
router.get('/:id', auctionController.getAuction); // :id est un paramètre
router.get('/lots/:id', auctionController.auctionLots);
router.put('/:id', checkAdmin, uploadPicture,  auctionController.updateAuction);
//router.put('/add/:id', checkAdmin,uploadPicture, auctionController.addLot);
router.patch('/close/:id', checkAdmin, auctionController.closeAuction);
router.delete('/:id', checkAdmin, auctionController.deleteAuction);

module.exports = router;