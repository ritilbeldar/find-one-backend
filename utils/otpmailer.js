// utils/otpsend.js
const nodemailer = require("nodemailer");
const ErrorHandler = require("./ErrorHandler");

const otpsend = async (email, otp, fullname) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_EMAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "Clothes Pvt Limt",
      to: email,
      subject: "Verify Your Account With OTP",
      html: `<p>Dear ${fullname},</p>
        <p>Your OTP for account verification is: ${otp}</p>
        <p>If you didn't register with us, please ignore this email.</p>
        <p>Best regards,<br>Clothes</p>`,
    };

    const info = await transporter.sendMail(mailOptions); // Corrected to sendMail
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

module.exports = otpsend;
