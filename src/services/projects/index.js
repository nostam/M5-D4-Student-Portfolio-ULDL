const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { writeDB, readDB } = require("../../lib");

router.get("/", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "projects.json");
    res.send(db);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "projects.json");
    const entry = db.find((entry) => entry.id === req.params.id.toString());
    if (entry) {
      res.send(entry);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
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
  async (req, res, next) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        const e = new Error();
        e.message = err; // e msg is not sending to the frontend
        e.httpStatusCode = 400;
        // console.log(err.array());
        next(e);
      } else {
        const db = await readDB(__dirname, "projects.json");
        const newEntry = {
          ...req.body,
          id: uniqid(),
          creationDate: new Date(),
        };
        const students = await readDB(__dirname, "../students/students.json");
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
        await writeDB(db, __dirname, "projects.json()");
        students
          .filter((student) => student !== req.body.studentId)
          .push(student);
        await writeDB(students, __dirname, "../students/students.json");
        res.status(201).send({ id: newEntry.id });
      }
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "projects.json");
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    await writeDB(newDb, __dirname, "projects.json");
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
        writeDB(newDb, __dirname, "projects.json");
        res.send(newDb);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
