const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const router = express.Router();
const { check, validationResult } = require("express-validator");

readDb = (file) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, file)).toString());
};
writeDb = (newDb, file) => {
  return fs.writeFileSync(path.join(__dirname, file), JSON.stringify(newDb));
};

router.get("/", (req, res, next) => {
  const db = readDb("projects.json");
  res.send(db);
});

router.get("/:id", (req, res, next) => {
  const db = readDb("projects.json");
  const entry = db.find((entry) => entry.id === req.params.id.toString());
  entry ? res.send(entry) : res.status(404).send();
});

router.post("/", (req, res, next) => {
  const db = readDb("projects.json");
  const newEntry = { ...req.body, id: uniqid(), creationDate: new Date() };
  const students = readDb("../students/students.json");
  const student = students.find((student) => student.id === req.body.studentId);
  if (
    Object.keys(student).length > 0 &&
    student.hasOwnProperty("numberOfProjects")
  ) {
    student.numberOfProjects++;
  } else {
    student.numberOfProjects = 1;
  }
  console.log(student);
  db.push(newEntry);
  writeDb(db, "projects.json");
  students.filter((student) => student !== req.body.studentId).push(student);
  writeDb(students, "../students/students.json");
  res.status(201).send({ id: newEntry.id });
});

router.delete("/:id", (req, res, next) => {
  const db = readDb("projects.json");
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  writeDb(newDb);
  res.status(204).send();
});

router.put("/:id", (req, res, next) => {
  const db = readDb();
  let entry = { ...req.body, id: req.params.id };
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  newDb.push(entry);
  writeDb(newDb);
  res.send(newDb);
});

module.exports = router;
