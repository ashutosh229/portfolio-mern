const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  if (!token) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while generating the token",
    });
  }
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    })
    .json({
      success: true,
      message: message,
      user: user,
      token: token,
    });
};

export default generateToken;
