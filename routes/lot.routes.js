const router = require("express").Router(); // On utilise le router d'express
const lotController = require("../controllers/lot.controller");
const { checkAdmin } = require("../middleware/admin.middleware");
const multer = require("multer");

var i = 1;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/lotUploads");
    },

    filename: function (req, file, cb) {
        if (file.fieldname === "pictures") {
            cb(null, `./Lot_${Date.now()}_picture_${i}.jpg`);
            i++;
        } else if (file.fieldname === "pictureMother") {
            cb(null, `./Lot_${Date.now()}_mother.jpg`);
        } else if (file.fieldname === "pictureFather") {
            cb(null, `./Lot_${Date.now()}_father.jpg`);
        } else if (file.fieldname === "veterinaryDocuments") {
            cb(null, `./Lot_${Date.now()}_${file.originalname.split(".pdf")[0]}.pdf`);
        } else if (file.fieldname === "blackType") {
            cb(null, `./Lot_${Date.now()}_blackType.pdf`);
        } else {
            cb(new Error("Champ du formulaire invalide"));
        }
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 8388608 }, // 8 Mo in octets
}).fields([
    { name: "pictures", maxCount: 10 },
    { name: "pictureMother", maxCount: 1 },
    { name: "pictureFather", maxCount: 1 },
    { name: "veterinaryDocuments", maxCount: 10 },
    { name: "blackType", maxCount: 1 },
]);

const uploadPicture = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err);
            return res.status(500).send(err.code);
        } else if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        next();
    });
};

router.get("/", lotController.getLots);
router.get("/:id", lotController.getLot);
router.post("/", checkAdmin, uploadPicture, lotController.createLot);
router.put("/:id", checkAdmin, uploadPicture, lotController.updateLot);
router.put("/extend/:id", checkAdmin, lotController.extend);
// router.get('/lotAndAuction/:id', lotController.lotAndAuction);
router.delete("/:id", checkAdmin, lotController.deleteLot);

module.exports = router;
