const express = require("express");
const router = express.Router();

const {
  createJob,
  deleteJob,
  updateJob,
  getAllJobs,
  getJob,
} = require("../controllers/jobs");

router.route("/").post(createJob).get(getAllJobs);
router.route("/:id").get(getJob).patch(updateJob).delete(deleteJob);

exports.jobsRouter = router;
