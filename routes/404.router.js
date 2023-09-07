const express = require('express');
const notFoundedRouter = express.Router();

notFoundedRouter.route('')
    .get(function(req, res) {
        res.render('404');
    })

module.exports = notFoundedRouter;