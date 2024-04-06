const express = require('express');
const passport = require('passport');
const loginRouter = express.Router();
const loginDemoAccount = require('../config/loginDemoAccount');

loginRouter.route('')
    .get(function(req, res) {
        if(req.user) return res.redirect('/');
        res.render('login');
    })
    .post(passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
        res.redirect('/');
    });

loginRouter.route('/demo')
    .post(loginDemoAccount, passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
        res.redirect('/');
    });

module.exports = loginRouter;