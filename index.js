const express = require('express')
const app = express()
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
let bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));

const userObj = {}
const userList = []

app.post('/api/users', (req, res) => {
  let user = req.body.username;
  const user_id = uuidv4()
  userObj[user_id] = user
  if (user) {
    userList.push({  _id: user_id ,username: user, log: []}); 
    res.json({ username: user, _id: user_id })
  }
})

app.get('/api/users',(req,res)=>{
  res.json(userList)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  const username = userObj[id];
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
  const duration = parseInt(req.body.duration);
  const description = req.body.description;

  const userDetails = userList.find(item => item._id === id);

  if (username) {
    const exercise = { description, duration, date };
    userDetails.log = userDetails.log || [];
    userDetails.log.push(exercise);
    const {_id,username} =userDetails;
    res.json({username,_id,...exercise });
  } else {
    res.json({ error: "Invalid Id" });
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = parseInt(req.query.limit);

  const userDetails = userList.find(item => item._id === id);

  if (userDetails) {
    let log = userDetails.log || [];

    if (from) {
      log = log.filter(exercise => new Date(exercise.date) >= new Date(from));
    }

    if (to) {
      log = log.filter(exercise => new Date(exercise.date) <= new Date(to));
    }

    if (limit) {
      log = log.slice(0, limit);
    }
    const count = log.length;
    res.json({ ...userDetails, log ,count});
  } else {
    res.json({ error: "Invalid Id" });
  }
});

const listener = app.listen(process.env.PORT || 3003, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
