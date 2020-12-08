const express = require("express");
const fs = require("fs");
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
  if (Array.isArray(req.body)) {
    res.status(406).send();
  } else {
    let newEntry = { ...req.body, id: uniqid() };
    const db = readDb();
    db.push(newEntry);
    fs.writeFileSync(path.join(__dirname, "students.json"), JSON.stringify(db));
    res.status(201).send({ id: newEntry.id });
  }
});

router.delete("/:id", (req, res) => {
  const db = readDb();
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  fs.writeFileSync(
    path.join(__dirname, "students.json"),
    JSON.stringify(newDb)
  );
  res.status(204).send();
});
router.put("/:id", (req, res) => {
  const db = readDb();
  let entry = { ...req.body, id: req.params.id };
  const newDb = db.filter((entry) => entry.id !== req.params.id.toString());
  newDb.push(entry);
  writeDb(newDb);
  res.send(newDb);
});
module.exports = router;
