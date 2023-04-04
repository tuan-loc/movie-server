const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");
const { ResponseSuccess, ResponseError } = require("../utils/response");

const model = new PrismaClient();

const addCinema = async (req, res) => {
  try {
    const { maHeThongRap, tenHeThongRap } = req.body;
    const errors = {};

    if (!req.file || !maHeThongRap || !tenHeThongRap) {
      if (!req.file) errors.file = "Vui lòng upload hình ảnh!";
      if (!maHeThongRap)
        errors.maHeThongRap = "Mã hệ thống rạp không được bỏ trống!";
      if (!tenHeThongRap)
        errors.tenHeThongRap = "Tên hệ thống rạp không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const { filename } = req.file;
    const isExists = await model.HeThongRap.findFirst({
      where: { ma_he_thong_rap: maHeThongRap },
    });

    if (isExists) {
      return res.json(ResponseError(400, "Mã hệ thống rạp đã tồn tại!"));
    }

    const result = await model.HeThongRap.create({
      data: {
        ma_he_thong_rap: maHeThongRap,
        ten_he_thong_rap: tenHeThongRap,
        logo: filename,
      },
    });
    return res.json(ResponseSuccess(200, result, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

module.exports = { addCinema };
