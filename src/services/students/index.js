const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// readDb = (file = "students.json") => {
//   const buffer = fs.readFileSync(path.join(__dirname, file));
//   const raw = buffer.toString();
//   return JSON.parse(raw);
// };
readDb = (file = "students.json") => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, file)).toString());
};
writeDb = (newDb, file = "students.json") => {
  return fs.writeFileSync(path.join(__dirname, file), JSON.stringify(newDb));
};

router.get("/", (req, res, next) => {
  const db = readDb();
  console.log(path.join(__dirname, "students.json"));
  res.send(db);
});

router.get("/:id", (req, res, next) => {
  const db = readDb("students.json");
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
    const db = readDb("students.json");
    const chkEmail =
      db.filter((entry) => entry.email === req.body.email).length > 0;
    if (Array.isArray(req.body)) {
      res.status(406).send();
    } else if (chkEmail) {
      res.status(422).send(); // or 409? 303?
    } else {
      const newEntry = { ...req.body, id: uniqid() };
      db.push(newEntry);
      writeDb(db, "students.json");
      // writeDb(db.push(newEntry), "students.json");
      res.status(201).send({ id: newEntry.id });
    }
  }
);

router.delete("/:id", (req, res, next) => {
  const db = readDb("students.json");
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  writeDb(newDb, "students.json");
  res.status(204).send();
});

router.put("/:id", (req, res, next) => {
  const db = readDb();
  let entry = { ...req.body, id: req.params.id };
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  newDb.push(entry);
  writeDb(newDb, "students.json");
  res.send(newDb);
});

router.post("/checkEmail", (req, res, next) => {
  const db = readDb();
  const entry = db.find((entry) => entry.email === req.body.email);
  res.send(entry);
});

module.exports = router;
