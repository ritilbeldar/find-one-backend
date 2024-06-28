const express = require("express");
const router = express.Router();

const {
  homepage,
  userRegister,
  otp_verify,
  userSignin,
  forgotPassword,
  updatePassword,
} = require("../controllers/indexController");

// GET /

router.get("/", homepage);

router.post("/userregister", userRegister);

router.post("/verify_otp/:username", otp_verify);

router.post("/usersignin", userSignin);

router.post("/forgotPassword", forgotPassword);

router.put('/updatePassword/:username', updatePassword);


// Products Start

module.exports = router;
