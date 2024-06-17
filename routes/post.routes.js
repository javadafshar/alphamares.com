const router = require("express").Router();
const postController = require("../controllers/post.controller");
const {
  checkAdmin
} = require("../middleware/admin.middleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/postPictures");
  },
  filename: function (req, file, cb) {
    if (file.fieldname === "picture") {
      cb(null, `Post_${Date.now()}_picture.jpg`);
    } else {
      cb(new Error("Invalid form field"));
    }
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8388608 // 8 MB
  }
}).single("picture");

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

router.get("/", postController.getPosts);
router.get("/:id", postController.postInfo);
router.post("/", checkAdmin, uploadPicture, postController.createPost);
router.put("/:id", checkAdmin, uploadPicture, postController.updatePost);
router.delete("/:id", checkAdmin, postController.deletePost);

module.exports = router;