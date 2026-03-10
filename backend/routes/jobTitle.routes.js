const express = require("express");
const router = express.Router();
const jobTitleController = require("../controllers/jobTitleController");
const auth = require("../middleware/auth");

router.get("/", auth, jobTitleController.getAll);

module.exports = router;
