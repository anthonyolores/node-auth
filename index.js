/*  EXPRESS SETUP  */

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const passport = require('passport');
const port = process.env.PORT || 3000;
const fb_app_id = 'your app id';
const fb_secret = 'your fb secret';

app.use(bodyParser.urlencoded({ extended: true }));

/*  Set Passport  */
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(
    function(username, password, done) {
      users.findOne({
              username: username
          }, 
          function(err, user) {
              if (err) {
                  return done(err);
              }
              else if (!user || user.password != password) {
                  return done(null, false);
              }
              else{
                  return done(null, user);
              }       
        });
    }
  ));
  passport.use(new FacebookStrategy({
    clientID: fb_app_id,
    clientSecret: fb_secret,
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
));

/* HTTP Requests */
app.get('/', (req, res) => res.sendFile('login.html', { root : __dirname}));
app.get('/success', (req, res) => res.send(`Hello ${req.query.username}`));
app.get('/error', (req, res) => res.send("Invalid User!!"));
app.get('/auth/facebook', passport.authenticate('facebook'));
app.post('/',
  passport.authenticate('local', { 
    failureRedirect: '/error' }),
    function(req, res) {
        res.redirect('/success?username='+req.user.username);
    }
);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success?username='+req.user.displayName);
  });

/* Set Mongoose*/
mongoose.connect('mongodb://localhost:27017/nodeauth');
const Schema = mongoose.Schema;
const userObj = new Schema({
      username: String,
      password: String
    });
const users = mongoose.model('users', userObj, 'users');

//start app
app.listen(port , () => console.log('listening on port ' + port));
