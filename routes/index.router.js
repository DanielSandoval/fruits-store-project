const express = require('express');
const indexRouter = express.Router();
const ensureAuthenticated = require('../config/ensureAuthenticatedFunc');
const { printHttpVerbAndRoute } = require('../util/printHttpVerbAndRoute');

indexRouter.route('')
    .get(printHttpVerbAndRoute, ensureAuthenticated, function (req, res) {
        if(req.user && req.user.role == 'admin') {
            res.render('index-admin', { user: req.user });
        }
        else {
            res.render('index', { user: req.user });
        }
    });

module.exports = indexRouter;