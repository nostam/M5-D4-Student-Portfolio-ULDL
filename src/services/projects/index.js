const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { writeDB, readDB } = require("../../lib");
const { writeFile } = require("fs-extra");
const { join } = require("path");
const { pipeline } = require("stream");
const zlib = require("zlib");
const multer = require("multer");

const upload = multer({});
const projectsImgDir = join(__dirname, "../../../public/img/projects");

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

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "reviews.json");
    const entry = db.find(
      (entry) => entry.projectID === req.params.id.toString()
    );
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
    body("description").isString().isAlphanumeric(),
    body("repoUrl").isURL().withMessage("invalid url").exists(),
    body("liveUrl").isURL().withMessage("invalid url").exists(),
    body("studentID").isString().isAlphanumeric(),
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
          id: uniqid("p"),
          creationDate: new Date(),
        };
        const students = await readDB(__dirname, "../students/students.json");
        const student = students.find(
          (student) => student.id === req.body.studentID
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
        await writeDB(db, __dirname, "projects.json");
        students
          .filter((student) => student.id !== req.body.studentID)
          .push(student);
        await writeDB(students, __dirname, "../students/students.json");
        res.status(201).send({ id: newEntry.id });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.post(
  "/:id/reviews/",
  [
    body("projectID")
      .isString()
      .isAlphanumeric()
      .withMessage("invalid project ID")
      .exists(),
    body("name")
      .isString()
      .isLength({ min: 2 })
      .withMessage("reviewer name is too short")
      .exists(),
    body("text").isString().exists(),
  ],
  async (req, res, next) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        const e = new Error();
        e.message = err;
        e.httpStatusCode = 400;
        console.log(e);
        next(e);
      } else {
        const db = await readDB(__dirname, "reviews.json");
        const newEntry = {
          ...req.body,
          id: uniqid("r"),
          date: new Date(),
        };
        db.push(newEntry);
        await writeDB(db, __dirname, "reviews.json");

        // const projects = await readDB(__dirname, "projects.json");
        // const proj = projects.find((project) => project.id === req.params.id);
        // if (
        //   Object.keys(proj).length > 0 &&
        //   proj.hasOwnProperty("numberOfReviews")
        // ) {
        //   proj.numberOfReviews++;
        // } else {
        //   proj.numberOfReviews = 1;
        // }
        // projects
        //   .filter((project) => project.id !== req.params.id)
        //   .push(project);
        // await writeDB(projects, __dirname, "projects.json");
        res.status(201).send({ id: newEntry.id });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.post(
  "/:id/uploadPhoto",
  upload.single("image"),
  async (req, res, next) => {
    try {
      const filenameArr = req.file.originalname.split(".");
      const filename =
        req.params.id + "." + filenameArr[filenameArr.length - 1];
      await writeFile(join(projectsImgDir, filename), req.file.buffer);
      const db = await readDB(__dirname, "projects.json");
      const project = db.find((entry) => (entry.id = req.params.id));
      const src = new URL(
        `https://${req.get("host")}/public/img/projects/${filename}`
      ).href;
      if (Object.keys(project).length > 0) {
        const newEntry = {
          ...project,
          image: src,
        };
        const newDB = db.filter((entry !== entry.id) !== req.params.id);
        newDB.push(newEntry);
        writeDB(newDB, __dirname, "projects.json");
        res.status(201).send();
      } else {
        throw new Error("invalid project ID");
      }
    } catch (error) {
      console.log(error);
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
    body("description").isString().isAlphanumeric(),
    body("repoUrl").isURL().withMessage("invalid url").exists(),
    body("liveUrl").isURL().withMessage("invalid url").exists(),
    body("studentID").isString().isAlphanumeric(),
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
