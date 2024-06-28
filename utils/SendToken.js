exports.sendtoken = (user, statusCode, res) => {
  const token = user.getjwttoken();

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // secure: true, // You can uncomment this line if you are using HTTPS
  };

  // Set the token in a cookie
  res.cookie("token", token, options);
  res.status(statusCode).json({ success: true, message: "User logged in successfully." , token,user });
};



