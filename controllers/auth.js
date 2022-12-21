const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
require("express-async-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// const mongoose = require()
const register = async (req, res) => {
  // const { email, name, password } = req.body;
  // if (!email || !name || !password) {
  //   throw new BadRequestError("Please provide Email , Name , Password");
  // }
  const user = await User.create({ ...req.body });
  const token = user.createJwt();
  console.log(token);
  res.status(StatusCodes.CREATED).send({ user: { name: user.name }, token });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email }).select("+password");
  const correctPassword = await user.correctPassword(password, user.password);
  console.log(correctPassword);
  if (!user || !correctPassword) {
    console.log("correctPassword");
    throw new UnauthenticatedError("Incorrect password or email.");
  }
  const token = user.createJwt();
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
    },
    token,
  });
};

module.exports = {
  register,
  login,
};
