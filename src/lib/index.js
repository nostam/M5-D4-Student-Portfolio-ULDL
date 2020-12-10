const fs = require("fs");
const path = require("path");

function readDb(dir, file) {
  return JSON.parse(fs.readFileSync(path.join(dir, file)).toString());
}
function writeDb(db, dir, file) {
  return fs.writeFileSync(path.join(dir, file), JSON.stringify(db));
}

module.exports = { readDb, writeDb };
