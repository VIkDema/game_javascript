const express = require("express");
const fs = require("fs");
let url = require("url");
const router = express.Router();
let records = JSON.parse(fs.readFileSync('records.json', 'utf8'));

router.post("/records", (request, response, next) => {
    records.push(request.body);
    records.sort((a, b) => a.score > b.score ? 1 : -1);
    records = records.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);
    records.length = 5;
    fs.writeFileSync('records.json', JSON.stringify(records), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
});
router.get("/records", (request, response, next) => {
    console.log(request.url);
    response.send(JSON.stringify(records));
});

module.exports = router;