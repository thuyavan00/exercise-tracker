const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const expressAsyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');
const User = require('.\\models\\userModel.js');
const Exercise = require('.\\models\\exerciseModel.js');

require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//post request to save users (testcase 1)
app.post(
  '/api/users',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      username: req.body.username,
    });
    const user = await newUser.save();
    res.send({
      username: user.username,
      _id: user._id,
    });
  })
);

//get request to fetch users (testcase 2)
app.get('/api/users', async (req, res) => {
  const Users = await User.find();
  const currentDate = new Date(Date.now());
  res.send(Users);
});

//post request to save exercise (testcase 4)
app.post(
  '/api/users/:_id/exercises',
  expressAsyncHandler(async (req, res) => {
    try {
      const uid = req.params._id;

      const user = await User.findOne({ _id: uid });
      let date = new Date(Date.now());
      if (req.body.date) {
        date = new Date(req.body.date);
        date.setHours(24, 0, 0, 0);
      }
      const newExercise = new Exercise({
        uid: uid,
        description: req.body.description,
        duration: req.body.duration,
        date: date,
      });

      const exercise = await newExercise.save();
      dateObject = new Date(exercise.date);
      dateString = dateObject.toDateString();
      res.send({
        _id: user._id,
        username: user.username,
        date: dateString,
        duration: exercise.duration,
        description: exercise.description,
      });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;

    // Construct query to filter logs based on userId and date range
    const query = { uid: userId };
    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    } else if (from) {
      query.date = { $gte: new Date(from) };
    } else if (to) {
      query.date = { $lte: new Date(to) };
    }

    // Find the user
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count total logs matching the query
    const totalCount = await Exercise.countDocuments(query);

    // Find logs based on the query and limit the results if needed
    let exerciseLogs;
    if (limit > 0) {
      exerciseLogs = await Exercise.find(query).limit(limit);
    } else {
      exerciseLogs = await Exercise.find(query);
    }

    // Construct the response object
    exerciseLogs.forEach((log) => {
      log._doc.date = new Date(
        new Date(log._doc.date).setHours(24, 0, 0, 0)
      ).toDateString();
    });

    toString = new Date(
      new Date(req.query.to).setHours(24, 0, 0, 0)
    ).toDateString();

    console.log(typeof toString);

    const response = {
      _id: userId,
      username: user.username,
      ...(req.query.to
        ? {
            to: new Date(
              new Date(req.query.to).setHours(24, 0, 0, 0)
            ).toDateString(),
          }
        : {}),
      count: totalCount,
      log: exerciseLogs.map((log) => ({
        description: log.description,
        duration: log.duration,
        date: log.date,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
