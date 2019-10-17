const express = require('express');
const router = express.Router();
const db = require('../models');
const passport = require('../config/ppConfig');

router.get('/signup', function(req, res) {
  res.render('auth/signup');
});

router.post('/signup', function(req, res) {
  // Find or create user
  db.user.findOrCreate({
    where: {
      email: req.body.email
    },
    defaults: {
      name: req.body.name,
      password: req.body.password
    }
  }).then(function([user, created]) {
    if (created) {
      console.log('User successfully created');
      passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'successfully created an account'
      })(req, res);
    } else {
      console.log('Email already exists');
      req.flash('error', 'Problem signing up');
      res.redirect('/auth/signup');
    }
  }).catch(function(err) {
    console.log(err);
    req.flash('error', 'you done gone fucked up');
    res.redirect('/auth/signup');
  });
});

router.get('/login', function(req, res) {
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: 'successfully logged in',
  failureRedirect: '/auth/login',
  failureFlash: 'invalid login details'
}));

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/');
});

module.exports = router;
