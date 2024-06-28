exports.AdminSendToken = (admin, statusCode, res) => {
  try {
    const admintoken = admin.getjwttoken();

    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      // secure: true,
    };

    res.status(statusCode).cookie("admintoken", admintoken, options);
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error in AdminSendToken:", error);
    res.status(500).send("Internal Server Error");
  }
};
