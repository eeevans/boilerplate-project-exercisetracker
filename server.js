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

app.post("/api/users/:id/exercises", function (req, res) {
  console.log("post create exercise")
  console.log(JSON.stringify(req.params.id))
  let description = req.body.description;
  let duration = Number(req.body.duration);
  let id = Number(req.params.id);
  let date = req.body.date ?? new Date().toDateString();
  let exerciseArray = excercises.get(id);
  exerciseArray.log.push({ description: description, duration: duration, date: date });
  res.status(200).json({ _id: id.toString(), username: users.get(id), description: description, duration: duration, date: date });
});

app.get("/api/users/:_id/logs", function (req, res) {
  console.log("post create exercise")
  console.log(JSON.stringify(req.params))
  console.log(JSON.stringify(req.query))
  let id = Number(req.params._id);
  let exerciseArray = excercises.get(id);
  let outputArray = exerciseArray.log.slice();
  //check range
  let from = new Date(req.query.from);
  let to = new Date(req.query.to);
  if (from && to) {
    outputArray = outputArray.filter((value, index) => {
      let exerciseDate = new Date(value.date);
      return (exerciseDate >= from && exerciseDate <= to);
    })
  }
  //check limit
  let limit = Number(req.query.limit);
  if (limit) {
    outputArray = outputArray.slice(0, limit);
  }
  res.status(200).json({ _id: id.toString(), username: users.get(id), count: outputArray.length, log: outputArray });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
