const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");

// exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
//   const { token } = req.cookies;

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized: No token provided" });
//   }
  
//   try {
//     const { id } = jwt.verify(token, process.env.JWT_SECRET);
//     req.id = id;
//     next();
//   } catch (error) {
//     console.error(error);
//     return res.status(401).json({ error: "Unauthorized: Invalid token" });
//   }
// });





exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.id = id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
});