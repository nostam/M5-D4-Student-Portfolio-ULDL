const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { readDB, writeDB } = require("../../lib");
const { join } = require("path");
let d = new Date();
let year = d.getFullYear();
let month = d.getMonth();
let day = d.getDate();
let startDate = new Date(year - 100, month, day).toDateString();
let endDate = new Date(year - 8, month, day).toDateString();

<<<<<<< HEAD
router.get("/", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "students.json");
=======
let d = new Date();
let year = d.getFullYear();
let month = d.getMonth();
let day = d.getDate();
let startDate = new Date(year - 100, month, day).toDateString();
let endDate = d.toDateString();

router.get("/", (req, res, next) => {
  try {
    const db = services.readDb(__dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
    res.send(db);
  } catch (error) {
    next(error);
  }
});

<<<<<<< HEAD
router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "students.json");
=======
router.get("/:id", (req, res, next) => {
  try {
    const db = services.readDb(__dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
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
<<<<<<< HEAD
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
=======
  (req, res, next) => {
    try {
      const errors = validationResult(req);

>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
<<<<<<< HEAD
        const db = await readDB(__dirname, "students.json");
=======
        const db = services.readDb(__dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
        const chkEmail = db.some((entry) => entry.email === req.body.email);
        if (Array.isArray(req.body)) {
          res.status(406).send();
        } else if (chkEmail) {
          res.status(422).send(); // or 409? 303?
        } else {
<<<<<<< HEAD
          const newEntry = { ...req.body, id: uniqid("s") };
          db.push(newEntry);
          await writeDB(db, __dirname, "students.json");
=======
          const newEntry = { ...req.body, id: uniqid() };
          db.push(newEntry);
          services.writeDb(db, __dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
          res.status(201).send({ id: newEntry.id });
        }
      }
    } catch (error) {
<<<<<<< HEAD
      console.log(error);
=======
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
      next(error);
    }
  }
);

<<<<<<< HEAD
router.delete("/:id", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "students.json");
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    await writeDB(newDb, __dirname, "students.json");
=======
router.delete("/:id", (req, res, next) => {
  try {
    const db = services.readDb(__dirname, "students.json");
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    services.writeDb(newDb, __dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
<<<<<<< HEAD
    const db = readDB(__dirname, "students.json");
    let entry = { ...req.body, id: req.params.id };
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    newDb.push(entry);
    writeDB(newDb, __dirname, "students.json");
=======
    const db = services.readDb(__dirname, "students.json");
    let entry = { ...req.body, id: req.params.id };
    const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
    newDb.push(entry);
    services.writeDb(newDb, __dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
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
<<<<<<< HEAD
        const db = readDB(__dirname, "students.json");
=======
        const db = services.readDb(__dirname, "students.json");
>>>>>>> a2f5852bdb80f3b51f7e8b25260c6106ae11e547
        const entry = db.find((entry) => entry.email === req.body.email);
        res.send(entry);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
