const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { admintoken } = req.cookies;

  if (!admintoken) {
    res.redirect("/admin/login");
  }

  const { id } = jwt.verify(admintoken, process.env.JWT_SECRET);
  req.id = id;
  next();
});
