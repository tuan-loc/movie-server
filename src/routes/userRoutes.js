const express = require("express");
const userRoutes = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authentication");

userRoutes.get("/lay-danh-sach-loai-nguoi-dung", userController.getRoleUser);
userRoutes.post("/dang-ky", userController.register);
userRoutes.post("/dang-nhap", userController.login);
userRoutes.get("/lay-danh-sach-nguoi-dung", userController.getUser);
userRoutes.get(
  "/lay-danh-sach-nguoi-dung-phan-trang",
  userController.getUserPagination
);
userRoutes.get("/tim-kiem-nguoi-dung", userController.getUser);
userRoutes.get(
  "/tim-kiem-nguoi-dung-phan-trang",
  userController.getUserPagination
);

userRoutes.post(
  "/them-nguoi-dung",
  authenticate,
  authorize("QuanTri"),
  userController.addUser
);

module.exports = userRoutes;
