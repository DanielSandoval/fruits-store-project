const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/mongo_models/user.mongo');

module.exports = function() {
    passport.use(new LocalStrategy({
            usernameField: 'username',
            password: 'password'
        },
        function(username, password, done) {
            User.findOne({username}, function(err, user) {
                if(err) { return done(err); }
                if(!user) { return done(null, false); }
                if(!bcrypt.compareSync(password, user.password)) { return done(null, false); }
                return done(null, user);
            });
        }
    ));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}