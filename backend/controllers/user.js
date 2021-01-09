const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// =============================================================================

exports.createUser = (req, res, next) => { 

  bcrypt.hash(req.body.password, 10)
    .then((hash) => {

      const user = new User({
        email: req.body.email,
        password: hash
      });

      console.log(user);

      user.save()
        .then((result) => {
          res.status(201).json({
            message: 'User was created',
            result: result
          });
        })
        .catch((err) => {
          res.status(500).json({           
              message: 'Invalid authentication credentials!'         
          });
        });
    });
}

// =============================================================================

exports.userLogin = (req, res, next) => {

  let fetchedUser;

  User.findOne({
      email: req.body.email
    })
    .then((user) => {

      if (!user) {
        return res.status(401).json({
          message: 'Auth failed (no user)'
        });
      }

      fetchedUser = user;

      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {

      if (!result) {
        return res.status(401).json({
          message: 'Auth failed (bycrypt fail)'
        });
      }

      // Generating web token 
      const token = jwt.sign({
          email: fetchedUser.email,
          userId: fetchedUser._id
        },
        process.env.JWT_KEY, {
          expiresIn: '1h'
        });

      // Returning web token 
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
        email: fetchedUser.email
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: 'Invalid authentication credentials!'
      });
    });
}
