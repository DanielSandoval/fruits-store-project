const express = require('express');
const aboutRouter = express.Router();

aboutRouter.route('')
    .get(function(req, res) {
        res.render("about");
    });

module.exports = aboutRouter;