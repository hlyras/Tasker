const express = require('express');
const app = express();

const session = require('express-session');
const passport = require('passport');

require('dotenv').config();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', 'app/view');
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Sessão
app.use(session({
  secret: 'SUA_CHAVE_SECRETA',
  resave: false,
  saveUninitialized: false
}));

// Inicializa o Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if ((req.headers["x-forwarded-proto"] || "").endsWith("http")) {
    res.redirect(`https://${req.hostname}${req.originalUrl}`);
  } else {
    next();
  }
});

app.use('/', require('./app/route/index'));

app.use(function (req, res, next) {
  res.status(404);

  res.format({
    html: function () {
      res.render('404', { url: req.url });
    },
    json: function () {
      res.json({ error: 'Not found' });
    },
    default: function () {
      res.type('txt').send('Not found');
    }
  })
});

module.exports = app;