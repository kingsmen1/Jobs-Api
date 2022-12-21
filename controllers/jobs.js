const { StatusCodes } = require("http-status-codes");
const Job = require("../models/Job");
const { NotFoundError } = require("../errors");
const { BadRequestError } = require("../errors");

const getAllJobs = async (req, res) => {
  console.log(req.user.userId);
  const jobs = await Job.find({ createdBy: req.user.userId });
  res.status(StatusCodes.OK).json({
    jobs,
    count: jobs.length,
  });
};
const getJob = async (req, res) => {
  //Deconstructing.
  const {
    user: { userId },
    params: { id },
  } = req;

  const job = await Job.findOne({ createdBy: userId, _id: id });
  if (!job) {
    throw new NotFoundError(`No job with id ${id}`);
  }
  res.status(StatusCodes.OK).json({
    job,
  });
};
const createJob = async (req, res) => {
  const { userId, name } = req.user;

  const job = await Job.create({
    company: req.body.company,
    position: req.body.position,
    status: req.body.status,
    createdBy: userId,
  });
  res.status(StatusCodes.CREATED).json({
    job,
  });
};
const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;
  if ((!company || !position || company === "", position === "")) {
    throw new BadRequestError("Company or Position fields cannot be empty");
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({
    job,
  });
};
const deleteJob = async (req, res) => {
  const {
    params: { id: jobId },
    user: { userId },
  } = req;
  const job = await Job.findOneAndRemove({ createdBy: userId, _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
