const express = require('express');
const chatRouter = express.Router();
const ensureAuthenticated = require('../config/ensureAuthenticatedFunc');

chatRouter.route('')
    .get(ensureAuthenticated, function(req, res) {
        res.render('chat', { user: req.user });
    });

chatRouter.route('/send-message')
    .post(ensureAuthenticated, function(req, res) {
        let message = req.body;
        console.log(message);
    });

module.exports = chatRouter;