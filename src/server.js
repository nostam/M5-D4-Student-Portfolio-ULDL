const express = require("express");
const cors = require("cors");
const students = require("./students");

const server = express();
const port = 3036;

server.use(cors());
server.use(express.json());
server.use("/students", students);
server.listen(port, () => console.log("Server is running on port: ", port));
