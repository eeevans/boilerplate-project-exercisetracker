const express = require('express')
const app = express()
const cors = require('cors')
const bp = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

// for parsing application/json
app.use(express.json());

// for parsing application/xwww-
app.use(express.urlencoded({ extended: true }));
//form-urlencoded

app.use((req, res, next) => {
  console.log("logging");
  let body = JSON.stringify(req.body) ?? "no body";
  let params = (!req.params) ? JSON.stringify(req.params) : "no params";
  console.log(req.method + " " + req.url + " " + body + params);
  //+ " " + req.url + " " + req.params + " " + req.body)
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = new Map();
const excercises = new Map();

function mapToOjectArray(map) {
  let users = new Array();
  map.forEach((value, key) => {
    users.push({ _id: key.toString(), username: value })
  });
  return users;
}

function mapLogsToObjectArray(map) {
  let logs = new Array();
  map.forEach((element) => {
    logs.push({ description: element.description, duration: element.duration, date: element.date.toDateString() })
  });
  return logs;
}

app.post("/api/users", function (req, res) {
  console.log("post create user")
  let username = req.body.username;
  let index = users.size + 1;
  users.set(index, username);
  excercises.set(index, { log: new Array() });
  res.json({ _id: index.toString(), username: username });
});

app.get("/api/users", function (req, res) {
  console.log("get create user")
  res.status(200).json(mapToOjectArray(users));
});

function parseDate(input, format) {
  format = format || 'yyyy-mm-dd'; // default format
  var parts = input.match(/(\d+)/g),
    i = 0, fmt = {};
  // extract date-part indexes from the format
  format.replace(/(yyyy|dd|mm)/g, function (part) { fmt[part] = i++; });

  return new Date(parts[fmt['yyyy']], parts[fmt['mm']] - 1, parts[fmt['dd']]);
}

app.post("/api/users/:id/exercises", function (req, res) {
  console.log("post create exercise")
  console.log(JSON.stringify(req.params.id))
  let description = req.body.description;
  let duration = Number(req.body.duration);
  let id = Number(req.params.id);
  let date = req.body.date ? parseDate(req.body.date) : new Date();
  let exerciseArray = excercises.get(id);
  exerciseArray.log.push({ description: description, duration: duration, date: date });
  let outputDate = date.toDateString();
  res.status(200).json({ _id: id.toString(), username: users.get(id), description: description, duration: duration, date: outputDate });
});

app.get("/api/users/:_id/logs", function (req, res) {
  console.log("post create exercise")
  console.log(JSON.stringify(req.params))
  console.log(JSON.stringify(req.query))
  let id = Number(req.params._id);
  let exerciseArray = excercises.get(id);
  let outputArray = exerciseArray.log.slice();
  console.log({ step: "before range", log: outputArray });
  //check range
  if (req.query.from && req.query.to) {
    let from = parseDate(req.query.from);
    let to = parseDate(req.query.to);
    outputArray = outputArray.filter((value, index) => {
      let exerciseDate = value.date;
      return (exerciseDate >= from && exerciseDate <= to);
    })
  }
  console.log({ step: "after range", log: outputArray });
  //check limit
  let limit = Number(req.query.limit);
  if (limit) {
    outputArray = outputArray.slice(0, limit);
  }
  console.log({ step: "after limit", log: outputArray });
  res.status(200).json({ _id: id.toString(), username: users.get(id), count: outputArray.length, log: mapLogsToObjectArray(outputArray) });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
