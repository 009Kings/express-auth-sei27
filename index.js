require('dotenv').config();
const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const isLoggedIn = require('./middleware/isLoggedIn');
const helmet = require('helmet');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./models');
const RateLimit = require('express-rate-limit');

const app = express();

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(ejsLayouts);
app.use(helmet());

// Make limiters for signup and login
// const loginLimiter = new RateLimit({
//   windowMs: 1000 * 60 * 5,
//   max: 3,
//   message: 'Maximum login attemps exceeded. Please try again later'
// });

// const signupLimiter = new RateLimit({
//   windowMs: 1000 * 60 * 60,
//   max: 3,
//   message: 'Maximum signup attemps exceeded. Please try again later'
// });

// app.use('/auth/login', loginLimiter);
// app.use('/auth/signup', signupLimiter);

const sessionStore = new SequelizeStore({
  db: db.sequelize,
  expiration: 1000 * 60 * 30
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

sessionStore.sync();

app.use(flash());

// MUST COME AFTER SESSION
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile');
});

app.use('/auth', require('./controllers/auth'));

let server = app.listen(process.env.PORT || 3000, ()=> {
  console.log(`🎧 You're listening to the smooth sounds of port ${process.env.PORT || 3000}`);
});

module.exports = server;
