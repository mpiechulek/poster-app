'esversion: 6';
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

// Conecting to database through moongose
mongoose.connect('mongodb+srv://admin:' + process.env.MONGO_ATLAS_PASSWORD +'@cluster0.ea8nz.mongodb.net/node-angular?retryWrites=true&w=majority', {
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
app.use('/images', express.static(path.join('backend/images')));

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

module.exports = app;
