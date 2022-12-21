require("dotenv").config({ path: "./config.env" });
require("express-async-errors");
//Security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const express = require("express");
const app = express();
const mongoConnnect = require("./db/connect");
const { auth } = require("./middleware/authentication");
const { authRouter, jobsRouter } = require("./routes/index");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("./errors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1); //will solve proxy issues on deployment on heroky etc.used with "rateLimiter".
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// extra packages

// routes
// app.get("/", (req, res) => {
//   res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
// });
app.post("/api/v1/auth/register", async (req, res) => {
  // const { email, name, password } = req.body;
  // if (!email || !name || !password) {
  //   throw new BadRequestError("Please provide Email , Name , Password");
  // }
  const user = await User.create({ ...req.body });
  const token = user.createJwt();
  console.log(token);
  res.status(StatusCodes.CREATED).send({ user: { name: user.name }, token });
});
app.post("/api/v1/auth/login", async (req, res) => {
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
});
app.post("/api/v1/jobs", auth, jobsRouter);

// app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await mongoConnnect(process.env.MONGO_URI);
    console.log("DataBase connected!");
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
