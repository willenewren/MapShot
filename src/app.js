// config enviroment variables
/* if(process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}*/

// Import Modules and Config
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const db = require('./config/db.js')

const app = express();

require('./config/passport-config')(passport);

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(bodyParser.urlencoded());


// for logging as necesarry
app.use(function(req, res, next) {
  next();
});
// Express session
app.use(
    session({
      secret: 'map',
      resave: false,
      saveUninitialized: false,
    }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Routes
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/pin', require('./routes/pin'));
app.use('/bucket', require('./routes/bucket'));


app.use(express.static(path.join(__dirname, 'public')));

// function to return the 404 message and error to client
app.get('*', function(req, res, next) {
  const error = new Error('Not Found');
  error.status = 404;
  res.render('error', {status: error.status, error: "Not Found"});
});


app.use(function(error, req, res, next) {
  res.status(error.status || 500);
  res.json({
    error : {
      message: error.message
    }
  });
  console.log("ERROR: ", error);
});

app.use(function(error, req, res, next) {
  res.status(error.status || 500);
  res.json({
    error : {
      message: error.message
    }
  });
  console.log("ERROR: ", error);
});

module.exports = app;
