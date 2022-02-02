const express = require("express");
const server = express();
const routes = require("./routes");
const bodyParser = require("body-parser");
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(express.static(__dirname + '/'));
server.use("/api/", routes);
server.listen(8080);