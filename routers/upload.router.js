const express = require("express");
const router = express.Router();

const { uploadFiles } = require("../controllers/upload.controllers");

router.post("/multiple", uploadFiles);

module.exports = router;
