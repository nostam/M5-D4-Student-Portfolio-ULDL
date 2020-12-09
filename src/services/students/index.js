const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const services = require("../");

router.get("/", (req, res, next) => {
  // const db = services.readDb(__dirname, "students.json");
  const db = services.readDb(__dirname, "students.json");
  console.log(path.join(__dirname, "students.json"));
  res.send(db);
});

router.get("/:id", (req, res, next) => {
  const db = readDb2("students.json");
  const entry = db.find((entry) => entry.id === req.params.id.toString());
  entry ? res.send(entry) : res.status(404).send();
});

router.post(
  "/",
  [
    // body("name")
    //   .isString()
    //   .isLength({ min: 2 })
    //   .withMessage("name is too short")
    //   .exists(),
    // body("surname")
    //   .isString()
    //   .isLength({ min: 2 })
    //   .withMessage("surname is too short")
    //   .exists(),
    // body("email").isEmail().withMessage("invalid email").exists(),
    // body("dateOfBirth").isDate().withMessage("invalid url").exists(),
  ],
  (req, res, next) => {
    const db = services.readDb(__dirname, "students.json");
    const chkEmail = db.some((entry) => entry.email === req.body.email);
    if (Array.isArray(req.body)) {
      res.status(406).send();
    } else if (chkEmail) {
      res.status(422).send(); // or 409? 303?
    } else {
      const newEntry = { ...req.body, id: uniqid() };
      db.push(newEntry);
      services.writeDb(db, __dirname, "students.json");
      res.status(201).send({ id: newEntry.id });
    }
  }
);

router.delete("/:id", (req, res, next) => {
  const db = services.readDb(__dirname, "students.json");
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  services.writeDb(newDb, __dirname, "students.json");
  res.status(204).send();
});

router.put("/:id", (req, res, next) => {
  const db = services.readDb(__dirname, "students.json");
  let entry = { ...req.body, id: req.params.id };
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  newDb.push(entry);
  services.writeDb(newDb, __dirname, "students.json");
  res.send(newDb);
});

router.post("/checkEmail", (req, res, next) => {
  const db = services.readDb(__dirname, "students.json");
  const entry = db.find((entry) => entry.email === req.body.email);
  res.send(entry);
});

module.exports = router;
