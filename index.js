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
  res.send(Users);
});

//post request to save exercise (testcase 4)
app.post(
  '/api/users/:_id/exercises',
  expressAsyncHandler(async (req, res) => {
    const newExercise = new Exercise({
      uid: req.body.uid,
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date,
    });

    const exercise = await newExercise.save();
    const user = await User.findOne({ _id: req.body.uid });
    res.send({
      _id: user._id,
      username: user.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description,
    });
  })
);

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const user = await User.findOne({ _id: userId });
    const logCountResult = await Exercise.aggregate([
      {
        $match: {
          uid: userId,
        },
      },
      {
        $count: 'totalCount',
      },
    ]);

    const totalCount =
      logCountResult.length > 0 ? logCountResult[0].totalCount : 0;

    const exerciseLogs = await Exercise.find({ uid: userId });

    // Construct the response object
    const response = {
      _id: userId,
      username: user.username,
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
