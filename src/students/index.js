const express = require("express");
const fs = require("fs");
const path = require("path");
const { stringify } = require("querystring");
const uniqid = require("uniqid");
const { Z_BEST_SPEED } = require("zlib");

const router = express.Router();

router.get("/", (req, res) => {
  const rawFile = fs
    .readFileSync(path.join(__dirname, "students.json"))
    .toString();
  const db = JSON.parse(rawFile);
  res.status(200).send(db);
});

router.get("/:id", (req, res) => {
  const rawFile = fs
    .readFileSync(path.join(__dirname, "students.json"))
    .toString();
  const db = JSON.parse(rawFile);
  const student = db.filter(
    (student) => student.id === req.params.id.toString()
  );
  student.length > 0 ? res.status(200).send(student) : res.status(404).send();
});

router.post("/", (req, res) => {
  const newEntry = { ...req.body, id: uniqid() };
  const rawFile = fs
    .readFileSync(path.join(__dirname, "students.json"))
    .toString();
  const db = JSON.parse(rawFile);
  db.push(newEntry);
  fs.writeFileSync(path.join(__dirname, "students.json"), JSON.stringify(db));
  res.status(201).send({ id: newEntry.id });
});
module.exports = router;
