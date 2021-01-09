'esversion: 6';
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const {
  send
} = require('process');

const app = express();

// Conecting to database through moongose
mongoose.connect(process.env.MONGO_ATLAS_PASSWORD, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Connect to database');
  })
  .catch(() => {
    console.log('Connection failed!');
  });

// Body parser works for jason
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//any request targeting /images will be allowed
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/', express.static(path.join(__dirname, 'angular')));

// multer for file sending 

// CORS
app.use((req, res, next) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-Width, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, PUT, OPTIONS'
  );
  next();
});

// =============================================================================

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'angular', 'index.html'))
});

module.exports = app;
