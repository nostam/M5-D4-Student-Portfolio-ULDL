const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");

const router = express.Router();

router.get("/", (req, res) => {
  const rawFile = fs
    .readFileSync(path.join(__dirname, "students.json"))
    .toString();
  const db = JSON.parse(rawFile);
  res.status(200).send(JSON.parse(db));
});

module.exports = router;
