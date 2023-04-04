const express = require("express");
const cinemaRoutes = express.Router();
const cinemaController = require("../controllers/cinemaController");
const { authenticate, authorize } = require("../middlewares/authentication");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.cwd()}/public/images`);
  },
  filename: (req, file, cb) => {
    const d = new Date();
    const newName = d.getTime() + "_" + file.originalname;
    cb(null, newName);
  },
});
const upload = multer({ storage });

cinemaRoutes.post(
  "/them-he-thong-rap",
  authenticate,
  authorize("QuanTri"),
  upload.single("file"),
  cinemaController.addCinema
);

module.exports = cinemaRoutes;
