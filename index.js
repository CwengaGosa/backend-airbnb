const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();


app.use(cors({
  credentials: true,
  origin: "http://localhost:3000",
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL);

app.get("/test", (req, res) => {
  res.send("Hello World");
});

// register request
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });
    if (userDoc) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username,password: hashedPassword });

    await newUser.save();

    const token = jwt.sign({ username: newUser.username, id: newUser._id });

    res.status(201).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// login request
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });

    if (!userDoc) {
      return res.status(404).json({ message: 'user does not exist' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userDoc.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'incorrect password' });
    }

    const token = jwt.sign({ username: userDoc.username, id: userDoc._id }, '', { expiresIn: '1h' });

    res.status(200).json({ result: userDoc, token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(5000);
