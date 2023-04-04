const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/jwt");
const { ResponseSuccess, ResponseError } = require("../utils/response");

const model = new PrismaClient();

const getRoleUser = async (req, res) => {
  try {
    const roles = [
      { maLoaiNguoiDung: "QuanTri", tenLoai: "Quản trị" },
      { maLoaiNguoiDung: "KhachHang", tenLoai: "Khách hàng" },
    ];
    return res.json(ResponseSuccess(200, roles, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const register = async (req, res) => {
  try {
    let { taiKhoan, hoTen, email, soDt, matKhau } = req.body;
    if (!taiKhoan || !hoTen || !email || !soDt || !matKhau) {
      const errors = {};
      if (!taiKhoan) errors.taiKhoan = "Tài khoản không được bỏ trống!";
      if (!hoTen) errors.hoTen = "Họ tên không được bỏ trống!";
      if (!email) errors.email = "Email không được bỏ trống!";
      if (!soDt) errors.soDt = "Số điện thoại không được bỏ trống!";
      if (!matKhau) errors.matKhau = "Mật khẩu không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }
    const isUserExists = await model.NguoiDung.findFirst({
      where: { tai_khoan: taiKhoan },
    });
    const isEmailExists = await model.NguoiDung.findFirst({
      where: { email },
    });
    if (isUserExists || isEmailExists) {
      return res.json(
        ResponseError(
          400,
          ["Tài khoản hoặc email đã tồn tại!"],
          "Tài khoản hoặc email đã tồn tại!"
        )
      );
    }

    let hashPassword = bcrypt.hashSync(matKhau, 10);
    let data = {
      tai_khoan: taiKhoan,
      ho_ten: hoTen,
      email,
      so_dt: soDt,
      mat_khau: hashPassword,
      loai_nguoi_dung: "KhachHang",
    };
    await model.NguoiDung.create({ data });
    return res.json(
      ResponseSuccess(201, { taiKhoan, hoTen, email, soDt }, "User create!")
    );
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const login = async (req, res) => {
  try {
    const { taiKhoan, matKhau } = req.body;
    const errors = {};
    if (!taiKhoan || !matKhau) {
      if (!taiKhoan) errors.taiKhoan = "Tài khoản không được bỏ trống!";
      if (!matKhau) errors.matKhau = "Mật khẩu không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }
    const user = await model.NguoiDung.findFirst({
      where: { tai_khoan: taiKhoan },
    });

    if (!user) {
      return res.json(ResponseError(400, null, "Tài khoản không chính xác!"));
    }
    const checkPassword = bcrypt.compareSync(matKhau, user.mat_khau);
    if (!checkPassword) {
      return res.json(ResponseError(400, null, "Mật khẩu không chính xác!"));
    }
    const { accessToken } = generateToken(user);
    return res.json(
      ResponseSuccess(200, {
        accessToken,
        user: {
          taiKhoan: user.tai_khoan,
          hoTen: user.ho_ten,
          email: user.email,
          soDt: user.so_dt,
          loaiNguoiDung: user.loai_nguoi_dung,
        },
      })
    );
  } catch (error) {
    return res.json(ResponseError(500, null, "Lỗi server!"));
  }
};

const getUser = async (req, res) => {
  try {
    let { tuKhoa } = req.query;
    let userList = [];
    if (tuKhoa) {
      userList = await model.NguoiDung.findMany({
        where: { ho_ten: { contains: tuKhoa } },
      });

      if (userList.length === 0) {
        return res.json(ResponseError(400, [], "Không tìm thấy user!"));
      }
    } else {
      userList = await model.NguoiDung.findMany();
    }

    let lstUser = userList.map((item) => {
      return {
        taiKhoan: item.tai_khoan,
        hoTen: item.ho_ten,
        email: item.email,
        soDt: item.so_dt,
        loaiNguoiDung: item.loai_nguoi_dung,
      };
    });

    return res.json(ResponseSuccess(200, lstUser, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const getUserPagination = async (req, res) => {
  try {
    let { tuKhoa, soTrang, soPhanTuTrenTrang } = req.query;
    let userList = [];
    let skip = 0;
    let take = 20;

    if (soPhanTuTrenTrang) {
      take = Number(soPhanTuTrenTrang);
    }

    if (soTrang) {
      skip = (Number(soTrang) - 1) * take;
    }

    if (tuKhoa) {
      userList = await model.NguoiDung.findMany({
        where: { ho_ten: { contains: tuKhoa } },
        skip: skip,
        take: take,
      });

      if (userList.length === 0) {
        return res.json(ResponseError(400, [], "Không tìm thấy user!"));
      }
    } else {
      userList = await model.NguoiDung.findMany({ skip: skip, take: take });
    }

    let lstUser = userList.map((item) => {
      return {
        taiKhoan: item.tai_khoan,
        hoTen: item.ho_ten,
        email: item.email,
        soDt: item.so_dt,
        loaiNguoiDung: item.loai_nguoi_dung,
      };
    });

    return res.json(ResponseSuccess(200, lstUser, "Succeed!"));
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

const addUser = async (req, res) => {
  try {
    const { taiKhoan, hoTen, email, soDt, matKhau, loaiNguoiDung } = req.body;
    if (!taiKhoan || !hoTen || !email || !soDt || !matKhau || !loaiNguoiDung) {
      const errors = {};
      if (!taiKhoan) errors.taiKhoan = "Tài khoản không được bỏ trống!";
      if (!hoTen) errors.hoTen = "Họ tên không được bỏ trống!";
      if (!email) errors.email = "Email không được bỏ trống!";
      if (!soDt) errors.soDt = "Số điện thoại không được bỏ trống!";
      if (!matKhau) errors.email = "Mật khẩu không được bỏ trống!";
      if (!loaiNguoiDung)
        errors.loaiNguoiDung = "Loại người dùng không được bỏ trống!";
      return res.json(ResponseError(400, errors, errors));
    }

    const isUserExists = await model.NguoiDung.findFirst({
      where: { tai_khoan: taiKhoan },
    });

    if (isUserExists) {
      return res.json(ResponseError(400, null, "User đã tồn tại!"));
    }

    let hashPassword = bcrypt.hashSync(matKhau, 10);
    let data = {
      tai_khoan: taiKhoan,
      ho_ten: hoTen,
      email,
      so_dt: soDt,
      mat_khau: hashPassword,
      loai_nguoi_dung: loaiNguoiDung,
    };

    await model.NguoiDung.create({ data });
    return res.json(
      ResponseSuccess(
        200,
        { taiKhoan, hoTen, email, soDt, loaiNguoiDung },
        "Tạo người dùng thành công!"
      )
    );
  } catch (error) {
    return res.json(ResponseError(500, {}, "Server Error!"));
  }
};

module.exports = {
  register,
  login,
  addUser,
  getRoleUser,
  getUser,
  getUserPagination,
};
