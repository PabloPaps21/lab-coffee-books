require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const passport     = require('./config/passport'); // ghacer la carpeta config y arch passport
const session      = require('express-session');
//agregar middlewares
const {checkUser, isAuth} = require("./middlewares")

mongoose
  .connect('mongodb://localhost/coffee-books', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret:process.env.SECRET
  })
)
//passport config

app.use(passport.initialize());
app.use(passport.session());


// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'coffe & books';

const index = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const authRoutesGoogle = require('./routes/authRoutesGoogle')
const protectedRoutes = require('./routes/protectedRoutes');

app.use("/", checkUser, index);
app.use("/facebook", authRoutes);
app.use("/google", authRoutesGoogle);

//para restringir a usuarios logueados

app.use("/user", isAuth, protectedRoutes);


module.exports = app;
