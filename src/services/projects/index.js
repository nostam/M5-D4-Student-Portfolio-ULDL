const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const services = require("../");

router.get("/", (req, res, next) => {
  const db = services.readDb(__dirname, "projects.json");
  res.send(db);
});

router.get("/:id", (req, res, next) => {
  const db = services.readDb(__dirname, "projects.json");
  const entry = db.find((entry) => entry.id === req.params.id.toString());
  entry ? res.send(entry) : res.status(404).send();
});

router.post(
  "/",
  [
    body("name")
      .isString()
      .isLength({ min: 2 })
      .withMessage("repo name is too short")
      .exists(),
    body("repoURL").isURL().withMessage("invalid url").exists(),
    body("liveURL").isURL().withMessage("invalid url").exists(),
    body("studentId").isString().isAlphanumeric(),
  ],
  (req, res, next) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        const e = new Error();
        e.message = err; // e msg is not sending to the frontend
        e.httpStatusCode = 400;
        // console.log(err.array());
        next(e);
      } else {
        const db = services.readDb(__dirname, "projects.json");
        const newEntry = {
          ...req.body,
          id: uniqid(),
          creationDate: new Date(),
        };
        const students = services.readDb(
          __dirname,
          "../students/students.json"
        );
        const student = students.find(
          (student) => student.id === req.body.studentId
        );
        if (
          Object.keys(student).length > 0 &&
          student.hasOwnProperty("numberOfProjects")
        ) {
          student.numberOfProjects++;
        } else {
          student.numberOfProjects = 1;
        }
        db.push(newEntry);
        services.writeDb(db, __dirname, "projects.json()");
        students
          .filter((student) => student !== req.body.studentId)
          .push(student);
        services.writeDb(students, __dirname, "../students/students.json");
        res.status(201).send({ id: newEntry.id });
      }
    } catch (error) {
      console.log("err by catch");
      next(e);
    }
  }
);

router.delete("/:id", (req, res, next) => {
  try {
    const db = services.readDb(__dirname, "projects.json");
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    services.writeDb(newDb, __dirname, "projects.json");
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  [
    body("name")
      .isString()
      .isLength({ min: 2 })
      .withMessage("repo name too short")
      .exists()
      .withMessage("give repo a name"),
    body("repoURL").isURL().withMessage("invalid url").exists(),
    body("studentId").isString().isAlphanumeric(),
  ],
  (req, res, next) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        const e = new Error();
        e.message = { errors: err.array() };
        e.http.StatusCode = 400;
        next(e);
      } else {
        const db = readDb(__dirname, "projects.json");
        let entry = { ...req.body, id: req.params.id };
        const newDb = db.filter(
          (entry) => entry.id !== req.params.id.toString()
        );
        newDb.push(entry);
        services.writeDb(newDb, __dirname, "projects.json");
        res.send(newDb);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
