const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

const User = require("../models/authentication/userModel");
const otpSend = require("../utils/otpmailer");
const { generateFromEmail, generateUsername } = require("unique-username-generator");

const ErorrHandler = require("../utils/ErrorHandler");
const { sendtoken } = require("../utils/SendToken");
const flash = require("express-flash");

exports.notfound = catchAsyncErrors(async (req, res, next) => {
  res.render("404", { title: "Page Not Found" });
});

exports.homepage = catchAsyncErrors(async (req, res, next) => {
  try {
    res.json("Welcome to feelings connect");
  } catch (error) {
    console.error(error);
  }
});

exports.userRegister = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, username } = req.body;
    let user = await User.findOne({ email });
    // generateUsername("", 3)

    if (user) {
      if (user.verified) {
        return res
          .status(400)
          .json({ error: "This email is already registered." });
      } else {
        if (!user.username) {
          user.username = username;
          await user.save();
        }

        // Sending OTP to email
        const otp = Math.floor(1000 + Math.random() * 9000);
        user.otp = otp;
        await user.save();
        await otpSend(user.email, otp, user.username);

        return res
          .status(200)
          .json({
            success: "OTP sent for verification.",
            UserName: user.username,
          });
      }
    }

    user = new User({
      ...req.body,
      email,
      username,
    });
    await user.save();

    // Sending OTP to email
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp;
    await user.save();
    await otpSend(user.email, otp, user.username);
    console.log(user.username);

    return res
      .status(200)
      .json({
        success: "User data saved successfully. OTP sent for verification.",
        UserName: user.username,
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

exports.otp_verify = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.params.username;
    const { otp } = req.body;
    const user = await User.findOne({ username: userId });
    if (!user) {
      throw new ErorrHandler("User not found", 404);
    }
    if (!user.otp || otp !== user.otp.toString()) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    user.verified = true;
    user.otp = undefined;
    await user.save();

    return res
      .status(200)
      .json({
        success: "You have successfully verified. Now proceed to log in.",
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

exports.userSignin = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username })
      .select("+password +verified +dob")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.verified) {
      return res
        .status(401)
        .json({
          error:
            "Your email is not verified. Please verify your email to login.",
        });
    }

    const isMatch = user.comparepassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Wrong credentials." });
    }

    // If all checks pass, send token
    sendtoken(user, 200, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { username } = req.body;

    let user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please enter a valid username." });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp;
    await user.save();
    await otpSend(user.email, otp, user.username);

    return res
      .status(200)
      .json({ success: "OTP sent to your email for password reset." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { username } = req.params; 
    const { newPassword } = req.body;

    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please enter a valid username." });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});



// accounts start




// accounts end
