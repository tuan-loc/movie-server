const express = require("express");

const rootRouter = express.Router();

rootRouter.use("/quan-ly-nguoi-dung", require("./userRoutes"));
rootRouter.use("/quan-ly-rap", require("./cinemaRoutes"));

module.exports = rootRouter;
