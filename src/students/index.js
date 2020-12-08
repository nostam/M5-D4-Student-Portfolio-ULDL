const express = require("express");
const fs = require("fs");
const { userInfo } = require("os");
const path = require("path");
const { stringify } = require("querystring");
const uniqid = require("uniqid");
const { Z_BEST_SPEED } = require("zlib");

const router = express.Router();

function readDb() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "students.json")).toString()
  );
}
function writeDb(newDb) {
  return fs.writeFileSync(
    path.join(__dirname, "students.json"),
    JSON.stringify(newDb)
  );
}
router.get("/", (req, res) => {
  //   const rawFile = fs
  //     .readFileSync(path.join(__dirname, "students.json"))
  //     .toString();
  //   const db = JSON.parse(rawFile);
  const db = readDb();
  res.send(db);
});

router.get("/:id", (req, res) => {
  const db = readDb();
  const entry = db.filter((entry) => entry.id === req.params.id.toString());
  entry.length > 0 ? res.send(entry) : res.status(404).send();
});

router.post("/", (req, res) => {
  const db = readDb();
  const chkEmail =
    db.filter((entry) => entry.email === req.body.email).length > 0;
  if (Array.isArray(req.body)) {
    res.status(406).send();
  } else if (chkEmail) {
    res.status(422).send(); // or 409? 303?
  } else {
    const newEntry = { ...req.body, id: uniqid() };
    writeDb(db.push(newEntry));
    res.status(201).send({ id: newEntry.id });
  }
});

router.delete("/:id", (req, res) => {
  const db = readDb();
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  writeDb(newDb);
  res.status(204).send();
});

router.put("/:id", (req, res) => {
  const db = readDb();
  let entry = { ...req.body, id: req.params.id };
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  writeDb(newDb.push(entry));
  res.send(newDb);
});

router.post("/checkEmail", (req, res) => {
  const db = readDb();
  const entry = db.filter((entry) => entry.email === req.body.email);
  res.send(entry.length > 0);
});

module.exports = router;
