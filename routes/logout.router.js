const express = require('express');
const logoutRouter = express.Router();

logoutRouter.route('')
    .get(function(req, res) {
        req.logout();
        res.redirect('/login');
    });

module.exports = logoutRouter;