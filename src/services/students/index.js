const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../../lib");
const { writeFile } = require("fs-extra");
const { join } = require("path");
const { pipeline } = require("stream");
const zlib = require("zlib");
const multer = require("multer");

const upload = multer({});
const studentsImgDir = join(__dirname, "../../../public/img/students");
let d = new Date();
let year = d.getFullYear();
let month = d.getMonth();
let day = d.getDate();
let startDate = new Date(year - 100, month, day).toDateString();
let endDate = new Date(year - 8, month, day).toDateString();

router.get("/", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "students.json");
    res.send(db);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "students.json");
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
      .withMessage("name is too short")
      .exists(),
    body("surname")
      .isString()
      .isLength({ min: 2 })
      .withMessage("surname is too short")
      .exists(),
    body("email").isEmail().withMessage("invalid email").exists(),
    body("dateOfBirth")
      .isDate()
      .isAfter(startDate)
      .isBefore(endDate)
      .withMessage("invalid date")
      .exists(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const db = await readDB(__dirname, "students.json");
        const chkEmail = db.some((entry) => entry.email === req.body.email);
        if (Array.isArray(req.body)) {
          res.status(406).send();
        } else if (chkEmail) {
          res.status(422).send(); // or 409? 303?
        } else {
          const newEntry = { ...req.body, id: uniqid("s") };
          db.push(newEntry);
          await writeDB(db, __dirname, "students.json");
          res.status(201).send({ id: newEntry.id });
        }
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
      await writeFile(join(studentsImgDir, filename), req.file.buffer);
      const db = await readDB(__dirname, "students.json");
      const student = db.find((entry) => entry.id === req.params.id);
      const src = join(req.hostname, "./public/img/students/", filename);
      if (Object.keys(student).length > 0) {
        const newEntry = {
          ...student,
          image: src,
        };
        const newDB = db.filter((entry) => entry.id !== req.params.id);
        newDB.push(newEntry);
        await writeDB(newDB, __dirname, "students.json");
        res.status(201).send();
      } else {
        throw new Error("invalid student ID");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "students.json");
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    await writeDB(newDb, __dirname, "students.json");
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const db = readDB(__dirname, "students.json");
    let entry = { ...req.body, id: req.params.id };
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    newDb.push(entry);
    writeDB(newDb, __dirname, "students.json");
    res.send(newDb);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/checkEmail",
  body("name")
    .isString()
    .isLength({ min: 2 })
    .withMessage("name is too short")
    .exists(),
  body("surname")
    .isString()
    .isLength({ min: 2 })
    .withMessage("surname is too short")
    .exists(),
  body("email").isEmail().withMessage("invalid email").exists(),
  body("dateOfBirth")
    .isDate()
    .isAfter(startDate)
    .isBefore(endDate)
    .withMessage("invalid date")
    .exists(),
  (req, res, next) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        const e = new Error();
        e.message = { errors: err.array() };
        e.http.StatusCode = 400;
        next(e);
      } else {
        const db = readDB(__dirname, "students.json");
        const entry = db.find((entry) => entry.email === req.body.email);
        res.send(entry);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
