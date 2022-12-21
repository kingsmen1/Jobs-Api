require("express-async-errors");
const { UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
exports.auth = async (req, res, next) => {
  let token;
  //   console.log(req.headers.authorization);
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    throw new UnauthenticatedError(
      "You are not logged in! Please log in to get accesss"
    );
  }
  try {
    // console.log(req.headers.authorization.split(" ")[1]);
    token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, name: payload.name };
    // log(req.user.userId, req.user.name);
    next();
  } catch (e) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};
